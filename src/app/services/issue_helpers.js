angular.module('Trestle')

/**
 @ngdoc service
 @name Trestle.trIssueHelpers

 @description
 Simple service to hold methods helpful to working with issues.
 */
.service('trIssueHelpers', function($q, gh, trRepoModel) {
   var me = this,
       config_header = '<!-- TRESTLE',
       config_footer = '-->';

   this.mergeBodyConfig = function(body, configObj) {
      // Store the updated configuration on the issue
      return [body, config_header, JSON.stringify(configObj), config_footer].join('\n');
   };

   this.updateBuildStatus = function(issue) {
      var head_ref = issue.tr_pull_details.tr_head.sha;

      return gh.getStatus(trRepoModel.owner, trRepoModel.repo, head_ref).then(
         function(statusResults) {
            var sorted_statuses = null,
                success         = null;

            // Sort the build statuses
            sorted_statuses = _.sortBy(statusResults, 'updated_at');

            // Pick out the most recent successful build status.
            // This mimics github's behavior. Since the builds are all for the same
            // hash, as long as one of the builds passed we're good to go.
            success = _.last(_.where(sorted_statuses, {"state" : "success"}));

            issue.tr_build_status = statusResults;
            // Use the successful status if we have one, otherwise the most recent.
            issue.tr_top_build_status = success ? success : _.last(sorted_statuses);
         }
      );
   };

   /**
   * Spawns off queries to resolve all grafted on information for the issue.
   *  (all comments, counts, build status, pull request info, etc)
   * We call this every time the issue is retrieved so that we can get
   * the full details.
   */
   this._resolveIssueFields = function(issue) {
      // Add a quick list of the issue label names
      issue.tr_label_names = _.map(issue.labels, function(labelObj) {
         return labelObj.name;
      });

      // Spawn off all the resolve methods (may go async internally)
      resolveIssueConf(issue);
      resolveIssueComments(issue);
      resolvePullStatus(issue);
   };

   // When we get issues parse the description and add a custom feed called
   // `config` to the issue.
   // note: operation is provided in lowercase
   gh.addResponseExtractor(function(response, operation, what, url, headers, params) {
      // endpoint: issue list
      if (operation === 'get' && /^repos\/.+\/.+\/issues$/.exec(what)) {
         response = _.map(response, function(issue) {
            me._resolveIssueFields(issue);
            return issue;
         });
      }
      // endpoint: specific issue
      else if (operation === 'get' && /^repos\/.+\/.+\/issues\/[0-9]+$/.exec(what)) {
         var issue = response;
         me._resolveIssueFields(issue);
         return issue;
      }

      // Add override on pull request handler
      if (operation === 'get' && /^repos\/.+\/.+\/pulls$/.exec(what)) {
         response = _.map(response, function(pull) {
            pull.tr_head = pull.head;
            return pull;
         });
      }
      // endpoint: specific issue
      else if (operation === 'get' && /^repos\/.+\/.+\/pulls\/[0-9]+$/.exec(what)) {
         var pull = response;
         pull.tr_head = pull.head;
         return pull;
      }

      return response;
   });


   // -- Private Helpers --- //

   /**
   * Request all comments for the issue and attach them.
   * as part of this we are going to calculate voting information.
   */

   function _onCommentsUpdated(issue) {
      issue.tr_all_comments = issue.tr_review_comments.concat(issue.tr_comments);
      _calculateCommentVoting(issue);
   }

   function resolveIssueComments(issue) {
      issue.tr_comments = issue.tr_comments || [];
      issue.tr_review_comments = issue.tr_review_comments || [];
      _onCommentsUpdated(issue);

      issue.tr_comment_voting = {
         users: {
            //username: {
            //   avatar_url: "",
            //   count: <total int> // -1, 0, 1
            //}
         },
         total: 0   // <summed count>
      };

      // Go get all comments for the issue
      // - Get the comments as HTML so to simplify the +1 counting
      gh.getIssueComments(trRepoModel.owner, trRepoModel.repo, issue.number, {asHtml: true})
         .then(function(commentResults) {
            // Store on the issue
            issue.tr_comments = commentResults;
            _onCommentsUpdated(issue);
            _calculateTodos(issue);
         }
      );

      if (issue.pull_request && issue.pull_request.html_url) {
         gh.getPullComments(trRepoModel.owner, trRepoModel.repo, issue.number, {asHtml: true})
            .then(function(commentResults) {
               // Store on the issue
               issue.tr_review_comments = commentResults;
               _onCommentsUpdated(issue);
            });
      }
   }

   /**
    Finds all todos on the issue and creates a count of all and pending todos
    for an issue.
    */
   function _calculateTodos(issue) {
      // NOTE: We only look at the issue comments (not the review ones)
      // - convert all comments into doms by passing them to jquery
      var comments = _.map(_.pluck(issue.tr_comments, 'body_html'), $);

      var total = _.reduce(comments, function(count, comment) {
         // Find the comments
         return count + $('.task-list-item-checkbox', comment).length;
      }, 0);

      var finished = _.reduce(comments, function(count, comment) {
         // Find the comments
         return count + $('.task-list-item-checkbox:checked', comment).length;
      }, 0);

      if (total > 0) {
         issue.tr_todos = {
            total:     total,
            finished:  finished,
            remaining: total - finished
         };
      }
      else {
         issue.tr_todos = null;
      }

   }

   /**
   * Helper to calculate the voting details for the current issue given
   * the comments.
   */
   function _getCleanComment(commentHtml) {
      var dom = $(commentHtml);
      // strip code blocks so that things like `i = i+1` do not trigger
      // the plus one counting.
      $('code', dom).remove();
      // Attempt to strip links since they can contain text we don't care about
      $('a', dom).remove();

      return dom.text();
   }

   function _calculateCommentVoting(issue) {
      // Build set of all commentors so that reviewers appear in the list of
      // interested people
      var all_users = _.reduce(issue.tr_all_comments, function(memo, comment) {
         // Add the user to the object with the default settings
         memo[comment.user.login] = {
            avatar_url : comment.user.avatar_url,
            count      : 0
         };
         return memo;
      }, {});

      // Only take the issues direct comments into account when doing plus one counts
      var votes = _.reduce(issue.tr_comments, function(memo, comment) {
         var login = comment.user.login;

         // Extract any math out of the comment
         var counts = _getCleanComment(comment.body_html).match(/(?:\s|^)([-+][0-9]+)/gm);
         // - convert the string counts into numbers
         counts = _.map(counts, function(numStr) {return parseInt(numStr, 10);});
         // - Run the math for the comment (this is silly but allows people to
         //   have various pluses in their comment).
         var total = _.reduce(counts, function(memo, cur) {
            return memo + cur;
         }, 0);

         // Update the users total count with the new information
         // - Once a user has blackballed a pull it stays there
         if (total < 0 || memo[login].count < 0) {
            memo[login].count = -1;
         }
         else {
            memo[login].count = memo[login].count + total;
         }

         return memo;
      }, all_users);

      issue.tr_comment_voting = {
         users: votes,
         // Provide a total count for the pull
         // - If anyone gave the pull a negative review then the total is -1
         //   to blackball the issue.
         total: _.reduce(votes, function(count, voteDetails) {
            if(voteDetails.count < 0 || count < 0) {
               return -1;
            } else {
               return count + voteDetails.count;
            }
         }, 0)
      };
   }

   function resolveIssueConf(issue) {
      var config = {
         // Defualt the weights so that they are stable and *should* be at the
         // top of the columns.
         columnWeight:    -issue.number,
         milestoneWeight: -issue.number
      };

      var body = issue.body;

      var lines = _.map(body.split('\n'), function(line) {return line.trim();}),
          conf_begin = -1, conf_end = -1;

      function find_matching_line(offset, text) {
         var idx = _.findIndex(_.tail(lines, offset), function(line) {
             return line === text;
          });
         if (idx > -1) {
            idx = idx + offset;
         }
         return idx;
      }

      // Figure out where the configuration block is
      // - If, for some reason, there are more then one configuration blocks
      //   this will only find the first one.
      conf_begin = find_matching_line(0, config_header);
      if (conf_begin > -1) {
          conf_end = find_matching_line(conf_begin, config_footer);
      }

      if (conf_begin > -1 && conf_end > -1) {
         var config_str = lines.slice(conf_begin+1, conf_end).join('\n');
         try {
            config = _.defaults(JSON.parse(config_str), config);
            // Join non-config sections as the actual description
            // - Note: This strips the XML comment lines also
            body = [].concat(lines.slice(0, conf_begin),
                             lines.slice(conf_end + 1, lines.length-1)).join('\n');
         } catch (err) {
            console.error('Loading configuration:', body, err);
         }
      }

      // Store the extra configuration
      // XXX: change .config to .tr_config
      issue.config = config;
      // Store the cleaned up body
      issue.body = body;

      return issue;
   }

   /**
   * Spawn off queries to get build status and pull request details
   * added to the issue.
   */
   function resolvePullStatus(issue) {
      issue.tr_build_status = issue.tr_build_status || null;
      issue.tr_pull_details = issue.tr_pull_details || null;

      // If we have a valid pull for the issue, spawn off query for it's details
      if(issue.pull_request && issue.pull_request.html_url) {
         gh.getPull(trRepoModel.owner, trRepoModel.repo, issue.number)
            .then(function(pullResult) {
               issue.tr_pull_details = pullResult;
               me.updateBuildStatus(issue);
            });
      }
   }

})

/**
 @ngdoc filter
 @name  Trestle.issuesWithLabel

 @description
 Takes an array of GitHub issues and filters it down to only issues with the
 specified labelName

 @param {String} labelName The textual name of a label all issues must have to
        be returned by this filter.
 @returns {Array} Set of issues with the label
 */
.filter('issuesWithLabel', function() {
   return function(issues, labelName) {
      if (!labelName) { throw new Error('labelName must be set'); }

      return _.filter(issues, function(issue) {
         return _.contains(issue.tr_label_names, labelName);
      });
   };
})

/**
 @ngdoc filter
 @name  Trestle.issuesInBacklog

 @description
 Takes an array of GitHub issues and filters it down to only issues that do not
 have a label used for a column.

 @returns {Array} Set of issues that are not part of a column
 */
.filter('issuesInBacklog', function(trRepoModel) {
   return function(issues) {
      var columns = trRepoModel.config.columns;
      return _.filter(issues, function(issue) {
         return _.intersection(issue.tr_label_names, columns).length === 0;
      });
   };
})

/**
 @ngdoc filter
 @name  Trestle.filterMilestones

 @description
 Takes an array of GitHub issues and filters it down based upon milestone param.

 @param {String} milestone The name of the milestone to filter or
       '*' or 'none'

 @returns {Array} Set of issues that are not part of a column
 */
.filter('filterMilestones', function() {
   return function(issues, msFilter) {
      if('*' === msFilter) {
         return issues;
      } else if('none' === msFilter) {
         return _.filter(issues, function(issue) {
            return !issue.milestone;
         });
      } else {
         return _.filter(issues, function(issue) {
            return (issue.milestone && (issue.milestone.title === msFilter));
         });
      }
   };
})


/**
 @ngdoc filter
 @name  Trestle.nonColumnLabels

 @description
 Takes an array of label objects and filters it down to only labels that don't contain
 column labels.
*/
.filter('nonColumnLabels', function(trRepoModel) {
   return function(labels) {
      var col_labels = trRepoModel.config.columns;

      return _.filter(labels, function(label) {
         return !_.contains(col_labels, label.name);
      });
   };
})

;
