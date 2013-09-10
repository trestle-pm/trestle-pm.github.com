angular.module('Trestle.board')

.controller('IssueColumnCtrl', function($scope, gh, trRepoModel, trIssueHelpers) {
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
   };

   this.excludeColLabel = function(ghLabel) {
      return ghLabel.name !== this.labelName;
   };

   this._findIssueIdx = function(selectableObj) {
      var issue_id = $(selectableObj.item).data('issue-id');

      // Loop over the issues and find the one with the dragged issues id.
      var issue_idx = _.findIndex(trRepoModel.issues, function(issue) {
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
      var issue_idx = this._findIssueIdx(obj),
          all_issues = trRepoModel.issues;

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
         weight = 0;
         if (all_issues.length > 1) {
            weight = all_issues[1].config.weight - 1;
         }
      }
      else if (issue_idx === all_issues.length - 1) {
         weight = 0;
         if (all_issues.length > 1) {
            weight = all_issues[all_issues.length - 2].config.weight + 1;
         }
      }
      else {
         above = all_issues[issue_idx - 1].config.weight;
         below = all_issues[issue_idx + 1].config.weight;

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
      var moved_issue = all_issues[issue_idx],
          cur_weight = moved_issue.config.weight;

      console.log(cur_weight, moved_issue, below, above);
      if ( (below <= cur_weight) || (above >= cur_weight) ) {
         console.log('do it');
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
      var all_issues = trRepoModel.issues,
          issue = all_issues[this._findIssueIdx(obj)],
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
            console.log(labels);
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