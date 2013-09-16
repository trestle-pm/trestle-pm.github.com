/**
 @ngdoc overview
 @name  Trestle.login

 @description
 stuff about login
 */

// Add our module to the namespace
angular.module( 'Trestle.login', [])

.controller( 'LoginCtrl', function($http, $location, $modal, auth, gh) {
   // Always start with a blonk username/password and remember turned off
   this.username = this.password = '';
   this.rememberMe = false;

   this.attemptLogin = function() {
      var user = this.username,
          pass = this.password;

      // Make sure the user entered something
      if (!user || !pass) {
         // XXX look at basic field validation
         console.log('Dude you must enter something');
         return;
      }
      var options = {username:       this.username,
                     password:       this.password,
                     remember:       this.rememberMe,
                     noTokenHandler: this.onCreateToken
                    };

      auth.login(options).then(
         function(token) {
            // Pass the token off to the `gh` service
            // - Tell the github service how long to hold the authentication
            gh.setAccessToken(token);

            // Yeah, for successful auth so bounce the user to next page
            // - If the next page was supplied then use that otherwise
            //   bounce the user to the repo list by default
            $location.path('/repo');
         },
         function(err) {
            // XXX handle bad cred case (some kind of error screen
            console.log(err);
         });
   };

   this.onCreateToken = function(username, password) {
      var modal = $modal.open({
         templateUrl: 'login/create_token.tpl.html',
         backdrop:    'static'});

      return modal.result;
   };
})

;
