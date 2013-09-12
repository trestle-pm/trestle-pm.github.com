angular.module('Trestle')

.controller( 'ReposCtrl', function($scope, $stateParams, $location, gh, auth,
                                   trRepoModel, trIssueFilters, trSessionModel) {
   $scope.$id = "ResposCtrl_" + $scope.$id;

   this.init = function() {
      // Put the repo model into the scope so that templates can access it
      $scope.repoModel = trRepoModel;

      // Expose the filters
      $scope.issueFilters = trIssueFilters;

      $scope.sessionModel = trSessionModel;

      // Get the users details (avatar, name, ...)
      // - This a `Promise` that when resolved will update the toolbar
      $scope.sessionModel.user = gh.getUserDetails();
   };
})

;
