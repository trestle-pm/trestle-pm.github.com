angular.module('Trestle.board')

.controller('IssueColumnCtrl', function($scope, $filter, gh, trRepoModel, trIssueHelpers) {
   // Flag which will disable writing drag and drop changes to GitHub.
   // This is useful when debugging issues as we can make sure the values are
   // updated without affecting a GitHub repository.
   var disable_save = false;

   /**
    * options:
    *    labelName: The string for the label for this column or undefined.
    *    isBacklog: If true, this this should get all items that are not labeled
    *                with a column.
    *    isNoMilestone: If true, this should get all items that have no milestone.
    *    milestone: If true, we are a milestone column.
    */
   this.init = function(options) {
      this.labelName  = options.labelName;
      this.isBacklog  = !!options.isBacklog;
      this.milestone  = options.milestone || null;
      this.isNoMilestone = !!options.isNoMilestone;

      if(this.milestone || this.isNoMilestone) {
         this.columnName = (this.isNoMilestone ? 'No Milestone' : this.milestone.title);
      } else {
         this.columnName = (this.isBacklog ? 'Backlog' : this.labelName);
      }

      $scope.$id = "ColumnCtrl_" + this.columnName + $scope.$id;
   };

   //{ Helpers for working with the two column types
   this._getIssueWeight = function(issue) {
      return issue.config[this._isEditingMilestone() ? 'milestoneWeight' : 'columnWeight'];
   };

   this._setIssueWeight = function(issue, newWeight) {
      issue.config[this._isEditingMilestone() ? 'milestoneWeight' : 'columnWeight'] = newWeight;
   };

   this._isEditingMilestone = function() {
      return this.milestone || this.isNoMilestone;
   };
   //}

   /**
    * Called after the user has successfully moved an issue to a new location
    * in the columns.
    *
    * @precondition  The scope issue list is already updated
    * @postcondition The issue ordering in GitHub has been updated
    */
   this.onIssueMoved = function(issues, issue) {
      var new_idx = issues.indexOf(issue);

      var above = Number.MIN_VALUE,
          below = Number.MAX_VALUE,
          weight;

      if (new_idx === 0) {
         if (issues.length > 1) {
            // Place the issue just below the old top of column
            below  = this._getIssueWeight(issues[1]);
            weight = below - 1;
         }
         else {
            // There is nothing else in the issues list so just give the issue
            weight = 0;
         }
      }
      else if (new_idx === issues.length - 1) {
         if (issues.length > 1) {
            above  = this._getIssueWeight(issues[issues.length - 2]);
            weight = above + 1;
         }
         else {
            // There is nothing else in the column so put the issue in the middle
            weight = 0;
         }
      }
      else {
         above = this._getIssueWeight(issues[new_idx - 1]);
         below = this._getIssueWeight(issues[new_idx + 1]);

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

      // short circuit the loop to GitHub
      // - Set the new weight so that future drags have access to it
      this._setIssueWeight(issue, weight);
      // - Update the label so that our scope watches get updated
      // * remove all column labels
      issue.labels = _.filter(issue.labels, function(label) {
         return ! _.contains(trRepoModel.config.columns, label.name);
      });
      // * add the current column in (if the issue was moved to backlog then
      //   we do nothing leaving the column labels off)
      if (this.labelName) {
         var col_label_obj = _.findWhere(trRepoModel.labels, {name: this.labelName});
         issue.labels.push(col_label_obj);
      }
      issue.tr_label_names = _.pluck(issue.labels, 'name');

      // * ensure the issue is in the correct milestone (ie. milestone page)
      if (this._isEditingMilestone()) {
         // Clear the milestone
         issue.milestone = null;

         // Set the new milestone if there is one
         issue.milestone = this.milestone;
      }

      if (disable_save) {return;}

      // Update the copy in GitHub
      var new_body = trIssueHelpers.mergeBodyConfig(issue.body, issue.config);

      gh.updateIssue(trRepoModel.owner,
                     trRepoModel.repo,
                     issue.number,
                     {
                        body:      new_body,
                        labels:    issue.tr_label_names,
                        milestone: issue.milestone ? issue.milestone.number : null
                     });

   };
});
