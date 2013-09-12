angular.module('Trestle')

/**
 @ngdoc service
 @name  Trestle.trIssueFilters

 @description
 Holds the Trestle systems filter settings.  The model is a scope so users by
 `$watch` the values.

 @property {string} searchText The text to match against issue title/bodies.
 @property {string} owner      The login of a GitHub user to match against issues.
 @property {string} reviewer   Login of a GitHub user
 @property {string} milestone  Name of a GitHub milestone
 */
.service('trIssueFilters', function($rootScope) {
   var scope = $rootScope.$new();

   scope.searchText = null;
   scope.owner      = null;
   scope.milestone  = null;
   scope.reviewer   = null;

   return scope;
})

/**
 @ngdoc filter
 @name  Trestle.globalIssueFilter

 @description
 Applies the current `trIssueFilters` settings to an array of GitHub issues.
 */
.filter('globalIssueFilter', function(trIssueFilters) {
   // Helper to pull the search bars fitler text out of an issue
   function issue_search_text(issue) {
      return [issue.title, issue.body].join(' ').toLowerCase();
   }

   return function(issues) {
      if (trIssueFilters.searchText) {
         issues = _.filter(issues, function(issue) {
            return _.contains(issue_search_text(issue), trIssueFilters.searchText);
         });
      }

      if (trIssueFilters.owner) {
         issues = _.filter(issues, function(issue) {
            if (issue.assignee) {
               return issue.assignee.login === trIssueFilters.owner;
            }
            return false;
         });
      }

      if (trIssueFilters.milestone) {
         issues = _.filter(issues, function(issue) {
            if (issue.milestone) {
               return issue.milestone.title === trIssueFilters.milestone;
            }
            return false;
         });
      }

      if (trIssueFilters.reviewer) {
         issues = _.filter(issues, function(issue) {
            // An issue has a review if the user has added any comments to it
            return _.any(issue.tr_comments, function(comment) {
               return comment.user.login === trIssueFilters.reviewer;
            });
         });
      }

      return issues;
   };
})

.controller('IssueFilterCtrl', function(auth, trIssueFilters) {
   this.setFilter = function(filterName, filterValue) {
      // If the same value which was previously selected is selected again then
      // treat it as being toggled off.
      if (trIssueFilters[filterName] === filterValue) {
         filterValue = null;
      }

      // Update the actual filter
      trIssueFilters[filterName] = filterValue;
   };
})

;
