angular.module('Trestle.board')

.controller('IssueColumnCtrl', function($scope, $filter, gh, trRepoModel, trIssueHelpers) {
   /**
    * options:
    *    labelName: The string for the label for this column or undefined.
    *    isBacklog: If true, this this should get all items that are not labeled
    *                with a column.
    */
   this.init = function(options) {
      this.labelName  = options.labelName;
      this.isBacklog  = !!options.isBacklog;
      this.columnName = (this.isBacklog ? 'Backlog' : this.labelName);

      $scope.$id = "ColumnCtrl_" + this.columnName + $scope.$id;

      this.issues = [];
      this._updateIssueList();
      trRepoModel.$watch('issues', angular.bind(this, this._updateIssueList), true);
   };

   this.excludeColLabel = function(ghLabel) {
      return ghLabel.name !== this.labelName;
   };

   this._updateIssueList = function() {
      var issues;

      if (this.isBacklog) {
         issues = $filter('issuesInBacklog')(trRepoModel.issues);
      }
      else {
         issues = $filter('issuesWithLabel')(trRepoModel.issues, this.labelName);
      }

      this.issues = _.sortBy(issues, function(issue) {
         return [issue.config.weight, issue.title.toLowerCase()];
      });
   };

   this._findIssueIdx = function(issues, selectableObj) {
      var issue_id = $(selectableObj.item).data('issue-id');

      // Loop over the issues and find the one with the dragged issues id.
      var issue_idx = _.findIndex(issues, function(issue) {
         return issue.id === issue_id;
      });

      return issue_idx;
   };

   /**
    * Called after the user has successfully moved an issue to a new location
    * in the columns.
    *
    * @precondition  The scope issue list is already updated
    * @postcondition The issue ordering in GitHub has been updated
    */
   this._onIssueMoved = function(evt, obj) {
      var issues = this.issues,
          issue_idx = this._findIssueIdx(issues, obj);

      console.log('moved', issue_idx);

      // If the issue is not found that our column was updated due to the issue
      // being moved elsewhere.
      if (issue_idx === -1) {
         return;
      }

      var weight,
          above = Number.MIN_VALUE,
          below = Number.MAX_VALUE;

      if (issue_idx === 0) {
         if (issues.length > 1) {
            // Place the issue just below the old top of column
            below  = issues[1].config.weight;
            weight = below - 1;
         }
         else {
            // There is nothing else in the issues list so just give the issue
            weight = 0;
         }
      }
      else if (issue_idx === issues.length - 1) {
         if (issues.length > 1) {
            above  = issues[issues.length - 2].config.weight;
            weight = above + 1;
         }
         else {
            // There is nothing else in the column so put the issue in the middle
            weight = 0;
         }
      }
      else {
         above = issues[issue_idx - 1].config.weight;
         below = issues[issue_idx + 1].config.weight;

         if (above === 0) {
            weight = below / 2.0;
         }
         else if (below === 0) {
            weight = above / 2.0;
         }
         else {
            weight = (above + below) / 2.0;
         }
      }

      // Determine if any data needs to be updated.
      var moved_issue = issues[issue_idx],
          cur_weight = moved_issue.config.weight;

      if ( (below <= cur_weight) || (above >= cur_weight) ) {
         // short circuit the loop to GitHub so that future drags have access to
         // the correct weight
         moved_issue.config.weight = weight;

         // Update the copy in GitHub
         gh.getIssue(trRepoModel.owner, trRepoModel.repo, moved_issue.number)
            .then(function(serverIssue) {
               var new_body = trIssueHelpers.mergeBodyConfig(
                  serverIssue.body,
                  _.defaults({weight: weight}, serverIssue.config));

               return gh.updateIssue(trRepoModel.owner,
                                     trRepoModel.repo,
                                     moved_issue.number,
                                     {body: new_body});
            });
      }
   };

   this._onIssueReceived = function(evt, obj) {
      var issues = this.issues,
          issue = issues[this._findIssueIdx(issues, obj)],
          me = this;

      // Update the issues labels to only have our columns label
      gh.getIssue(trRepoModel.owner, trRepoModel.repo, issue.number)
         .then(function(issue) {
            // - Remove any of the old columns
            var labels = _.filter(_.pluck(issue.labels, 'name'), function(label) {
               return !_.contains(trRepoModel.config.columns, label);

            });
            // - Add our column
            labels.push(me.labelName);
            gh.updateIssue(trRepoModel.owner, trRepoModel.repo,
                           issue.number, {labels: labels})
            .then(function(updatedIssue) {
               console.log('move between columns done');
            });
         });
   };

   this.getSortableOptions = function() {
      var me = this;

      return {
         // Handle reorders
         // Note: Since jquery is triggering this we need to wrap it in a scope
         //       in order to $http and other angular services to know what to do.
         // Note: Using `stop` is `update` does not have the list updated yet
         stop: function(evt, obj) {
            $scope.$apply(me._onIssueMoved.call(me, evt, obj));
         },

         receive: function(evt, obj) {
            $scope.$apply(me._onIssueReceived.call(me, evt, obj));
         },

         // Allow dragging between the columns
         connectWith: '.column-body',
         helper: 'clone',
         opacity: 0.8
      };
   };

});
