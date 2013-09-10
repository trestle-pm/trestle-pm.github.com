angular.module('Trestle')

.controller( 'ReposCtrl', function($scope, $stateParams, $location, gh, auth, trRepoModel) {
   $scope.$id = "ResposCtrl_" + $scope.$id;

   this.init = function() {
      // Put the repo model into the scope so that templates can access it
      $scope.repoModel = trRepoModel;

      // Because this controller could be loaded right away, without going through
      // the login page, we must see if the user has a valid session.
      var token = auth.getAuthToken();
      if (!token) {
         $location.path('/login');
      }
      gh.setAccessToken(token);

      // Update configuration for repository service
      // Reload repository service (if needed)
   };
})

;
