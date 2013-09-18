angular.module('Trestle.board')

/**
 @ngdoc function
 @name  Trestle.board.ToolbarCtrl

 @description
 Provides the tools for handling the toolbar
 */
.controller('ToolbarCtrl', function($location, $stateParams, gh, trReposSrv,
                                    $timeout, $rootScope) {
   /**
    @ngdoc    method
    @name     init
    @methodOf Trestle.board.ToolbarCtrl

    @description
    Initializes the controller.

    XXX look at moving this to the show method
    */
   this.init = function() {
      var me = this;

      this.isRefreshing = false;

      gh.listAllRepos($stateParams.owner, $stateParams.repo).then(function(allRepos) {
         // Build up a tree of the issues to make things easier to search through
         me.allRepos = _.groupBy(allRepos, function(repo) {
            return repo.owner.login;
         });
      });
   };

   /**
    @ngdoc    method
    @name     onSwitchToRepo
    @methodOf Trestle.board.ToolbarCtrl

    @description
    Called when the user selectes a new repository to show a board for.
    */
   this.onSwitchToRepo = function (repo) {
      console.log('switch to repo: ' + repo.full_name);
      $location.path('/repo/' + repo.full_name + '/board');
   };

   this.refreshRepo = function() {
      var me = this;
      me.isRefreshing = true;
      trReposSrv.refreshSettings().then(function() {
         // Delay so they can at least see that it did something
         $timeout(function() {
            me.isRefreshing = false;
         }, 1000);
      });
   };

   this.markAllRead = function() {
      console.log('sending all marked');
      $rootScope.$emit('markAllIssuesRead');
   };
})

/**
 @ngdoc    function
 @name     Trestle.board.UserDetailsCtrl

 @description
 Provides controls for handling the users details area in the toolbar.
 Currently, this provides the ability to logout.
 */
.controller('UserDetailsCtrl', function($location, auth, gh) {

   /**
    @ngdoc    method
    @name     init
    @methodOf Trestle.board.UserDetailsCtrl

    @description
    Initializes the controller.
    */
   this.init = function() {
   };

   /**
    @ngdoc    method
    @name     onLogout
    @methodOf Trestle.board.UserDetailsCtrl

    @description
    Called when the user selects the logout button.  This will clear the cached
    session and redirect the user to the login page.
    */
   this.onLogout = function() {
      // Remove the users access token
      auth.logout();

      // Clear the gh token
      gh.setAccessToken(null);

      // Send us back to the login page
      $location.path('/login');
   };
})

;
