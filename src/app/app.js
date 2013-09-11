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

.config( function ( $stateProvider, $urlRouterProvider ) {

   // Repository base
   $stateProvider
      .state( 'repos', {
         url: '/repo',
         //abstract: true,
         views: {
            body: {
               templateUrl: 'repos.tpl.html'
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
            }
         },
         resolve: {
            repos_srv: function(trReposSrv, $stateParams) {
               trReposSrv.refreshSettings($stateParams);
            }
         },
         onEnter: function() {
            console.log('entering repos.board');
         }
      });

   // Milestone page
   // repos.milestones

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
