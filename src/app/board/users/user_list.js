angular.module('Trestle.board')

.controller('UsersListCtrl', function($stateParams, gh) {
   var me = this;

   me = [];

   gh.listRepoUsers($stateParams.owner, $stateParams.repo)
      .then(function(users) {
         me.users = users;
      });
})

;
