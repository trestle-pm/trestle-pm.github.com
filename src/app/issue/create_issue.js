var mod = angular.module('Trestle');

mod.directive('trNewIssueButton', function($modal) {
   return function(scope, element, attr) {
      element.on('click', function() {
         $modal.open({
            scope:       scope,
            backdrop:    true,
            keyboard:    true,
            templateUrl: 'issue/create.tpl.html'
         });
      });
   };
});

mod.controller('NewIssueCtrl', function($q, $rootScope, $scope, $modal, gh, trRepoModel) {
   this.onCreate = function(issueObj) {
      var issue = {
         title     : issueObj.title,
         body      : issueObj.description,
         milestone : issueObj.milestone,
         labels    : _.pluck(issueObj.labels, 'name'),
         assignee  : (issueObj.assignee || {}).login
      };

      return gh.createIssue(trRepoModel.owner, trRepoModel.repo, issue)
         .then(function(createdIssue) {
            console.log(createdIssue);
            // Save the issue since we already have the latest for it
            trRepoModel.issues.push(createdIssue);

            // Close this dialog
            $scope.$close();

            // Open the issue for editing
            var modal_scope = $rootScope.$new();
            modal_scope.issue     = createdIssue;

            console.log('show other issue');
            $modal.open({
               scope        : modal_scope,
               backdrop     : true,
               keyboard     : true,
               templateUrl  : "issue/issue_details.tpl.html"
            });
         });
   };

   this.toggleLabel = function(issue, label) {
      var labels = issue.labels || [];

      if (_.contains(labels, label)) {
         issue.labels =  _.without(labels, label);
      }
      else {
         labels.push(label);
         issue.labels = labels;
      }
   };
});
