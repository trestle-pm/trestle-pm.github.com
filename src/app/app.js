angular.module( 'Trestle', [
   'templates-app',
   'templates-common',
   'Trestle.board',
   'Trestle.login',
   'Trestle.issue',
   'Trestle.authentication',
   'github.api',
   'ui.sortable',
   'ui.bootstrap',
   'ui.bootstrap.dropdownToggleNoClose',
   'ui.router',
   'ngSanitize'
])

.run( function( $rootScope, $location ) {
   $rootScope.$on('$stateChangeError', function($event, current, previous, rejection) {
      // TODO: detect what caused failure.  (right now we assume an authentication failure)
      console.log('state change error: ' + arguments, arguments);

      // Redirect to login page because of auth failure
      $location.path('/login');
   });
})

.config( function ( $stateProvider, $urlRouterProvider ) {
   // Repository base
   $stateProvider
      .state( 'repo', {
         url: '/repo',

         views: {
            body: {
               templateUrl: 'repos.tpl.html'
            }
         },
         resolve: {
            // Setup credentials or redirect to login page
            // - if no token, then throw a reject to stop the transition
            // - else setup gh api with correct token
            auth_check: function(auth, gh, $q) {
               var token = auth.getAuthToken();
               if(!token) {
                  return $q.reject('no auth');
               }

               return gh.setAccessToken(token);
            }
         },
         onEnter: function() {
            console.log('entering repos');
         },
         onExit: function(trReposSrv) {
            trReposSrv.stop();
         }
      });

   $stateProvider.state('repo.selected', {
      url: '/:owner/:repo',
      abstract: true,

      views: {
         'filter@repo': {
            templateUrl: 'issue_filters/issue_filter.tpl.html'
         },
         'build-status@repo': {
            templateUrl: 'board/repo_build_status.tpl.html'
         }
      },
      resolve: {
         repos_srv: function(trReposSrv, $stateParams) {
            return trReposSrv.refreshSettings($stateParams);
         }
      },
      onEnter: function() {
         console.log('repo selected');
      }
   });

   // Board page
   $stateProvider
      .state('repo.selected.board', {
         url: '/board',

         views: {
            'columns@repo': {
               templateUrl: 'board/columns/issue_columns.tpl.html'
            }
         },
         onEnter: function() {
            console.log('entering repos.board');
         }
      });

   // Milestone page
   $stateProvider
      .state('repo.selected.milestones', {
         url: '/milestones',

         views: {
            'columns@repo': {
               templateUrl: 'board/columns/milestone_columns.tpl.html'
            }
         },
         onEnter: function() {
            console.log('entering repo.selected.milestone');
         }
      });


   // Login Page
   $stateProvider.state( 'login', {
     url: '/login',
     views: {
        body: {
           templateUrl: 'login/login.tpl.html'
        }
      },
      onEnter: function() {
         console.log('entering login');
      }
   });

   // Treat the board as the default choice
   $urlRouterProvider.when('/repo/:owner/:repo', function($match) {
         return ['/repo', $match.owner, $match.repo, 'board'].join('/');
   });

   $urlRouterProvider.otherwise('/login');
})

.controller( 'AppCtrl', function AppCtrl ( ) {
   // Controls everything outside of the ui-view
})

;
