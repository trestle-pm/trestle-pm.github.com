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
   'ui.state',
   'ui.route',
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
      .state( 'repos', {
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
               } else {
                  gh.setAccessToken(token);
               }
            }
         },
         onEnter: function() {
            console.log('entering repos');
         }
      });

   // Board page
   $stateProvider
      .state('repos.board', {
         url: '/:owner/:repo/board',
         views: {
            columns: {
               templateUrl: 'board/columns/issue_columns.tpl.html'
            },
            filter: {
               templateUrl: 'issue_filters/issue_filter.tpl.html'
            }
         },
         resolve: {
            repos_srv: function(trReposSrv, $stateParams) {
               return trReposSrv.refreshSettings($stateParams);
            }
         },
         onEnter: function() {
            console.log('entering repos.board');
         }
      });

   // Milestone page
   $stateProvider
      .state('repos.milestones', {
         url: '/:owner/:repo/milestones',
         views: {
            columns: {
               templateUrl: 'board/columns/milestone_columns.tpl.html'
            }
         },
         resolve: {
            repos_srv: function(trReposSrv, $stateParams) {
               return trReposSrv.refreshSettings($stateParams);
            }
         },
         onEnter: function() {
            console.log('entering repos.milestone');
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

   $urlRouterProvider.otherwise('/login');
})

.controller( 'AppCtrl', function AppCtrl ( ) {
   // Controls everything outside of the ui-view
})

;
