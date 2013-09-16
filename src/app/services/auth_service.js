/**
 @ngdoc overview
 @name  Trestle.authentication

 @description
 Holds services, controllers, etc related to authenticating users with the system.
 */
angular.module('Trestle.authentication', [])

.service('trSessionModel', function($rootScope) {
   var scope = $rootScope.$new();

   scope.user = null;

   return scope;
})

/**
 @ngdoc service
 @name  Trestle.authentication.auth

 @description
 Provides tools for logging in and out of the system and presisting the
 authentication across browser refreshes.
 */
.service('auth', function($q, $http) {
   var
   // The key to store session tokens under when using storage
   storage_key = 'trestle-gh-token',
   // Magic string we use to mark a GitHub authentication as ours.
   // This allows the user to be revoke authentication later on.
   auth_key    = 'trestle',
   // The current session token or null if there is no token
   token = null;

   // See if there was a token before so that the user can stay logged in
   // across sessions.
   token = localStorage ? localStorage.getItem(storage_key) : null;
   if ( !token ) {
      token = sessionStorage ? sessionStorage.getItem(storage_key) : null;
   }

   /**
    @ngdoc    function
    @name     setAuthToken
    @methodOf Trestle.authentication.auth
    @private

    @description
    Sets the active token and stores it in local or session storage depeneding
    on if the user wants the computer to remember them.

    Use `login` and `logout` to manipulate the token.

    @param {String}  newToken   The new token
    @param {boolean} rememberMe Flag indicating if the user trusts this computer
           and wants it to store the session token locally so that they do not
           need to login again.
    */
   function setAuthToken(newToken, rememberMe) {
      // Update in memory copy
      token = newToken;

      // Set the value into storage if the user wants future sessions to
      // be authenticated.
      if (rememberMe && localStorage) {
         localStorage.setItem(storage_key, token);
      }
      else if (window.sessionStorage) {
         sessionStorage.setItem(storage_key, token);
      }
   }

   /**
    @ngdoc    function
    @name     getAuthToken
    @methodOf Trestle.authentication.auth

    @description
    Provides access to the current token.

    @returns {String|null} The current token or null if none is set
    */
   this.getAuthToken = function() {
      return token;
   };

   /**
    @ngdoc    function
    @name     logout
    @methodOf Trestle.authentication.auth

    @description
    Logs the user out of the system and clears the stored token so that
    reloading the page does not automatically log them back in.
    */
   this.logout = function() {
      // Clear the in memory version
      token = null;

      // Clear both of the storages
      _.each([localStorage, sessionStorage], function(storage) {
         storage.removeItem(storage_key);
      });
   };

   /**
    @ngdoc    function
    @name     login
    @methodOf Trestle.authentication.auth

    @description
    Attempts to log the user in to GitHub and if successful then returns the auth
    token from GitHub.

    This uses basic authentication instead of OAUTH because we do not have a
    secure location to store the OAUTH secret for the Trestle application.  To
    work around this we the provided credentials create a token we can use and
    then store it in GitHub so that the user can revoke the authentication
    later on.

    @param {string} opts.username The username to authenticate with
    @param {string} opts.password the passowrd to authenticate with
    @param {boolean} remember flag determining if the users token should be
           stored after the user leaves the page.
    @param {function} noTokenHandler Called when the user does not currenly have
           an auth token for trestle.  The function takes no arguments and
           returns a promise which is resolved only if the user is ok with
           creating a token.

    @returns {Promise} The success chain will be fired with the users token if
             they provided credentials were correct.
    */
   this.login = function(opts) {
      // Query GitHub to see if the creds were valid
      var p = $http({
         method: 'GET',
         url:    'https://api.github.com/authorizations',
         headers: {
            Authorization: 'Basic ' + window.btoa(opts.username + ':' + opts.password)
         }
      });

      // On success store the token for later use
      // Otherwise, return an error
      return p.then(angular.bind(this, this._onLoginSuccess, opts),
                    angular.bind(this, this._onLoginError));
   };

   /**
    @ngdoc    function
    @name     _onLoginSuccess
    @methodOf Trestle.authentication.auth

    @description
    Called when the user provides valid credentials to the `login` method with
    the HTTP response.

    Looks through the users existing authorizations to see if Trestle is
    already authorized.  If so that we use its token.  If this is the first time
    Trestle has logged in then a new authorization is created and that token is
    returned.

    The new token is also cached in memory and storage so that the user does not
    need to log in again later (if they do not want to).

    @param {boolean} opts.remember Flag indicating if the token aquired from GitHub
           should be cached locally.
    @param {object} res The HTTP response from GitHub.  see HttpPromise in
           angular docs.

    @returns {String|Promise} The token to use
    */
   this._onLoginSuccess = function(opts, res) {
      var auths = res.data;
      // See if any of the authorizations are for our app
      var auth = _.find(auths, function(auth) {
         return auth.note === auth_key;
      });

      // Yeah, the user already had a token for us
      if (auth) {
         // Store the token for later
         setAuthToken(auth.token, opts.remember);
         // Return the new token in case people need to use it.
         return token;
      }

      // The user did not have a token for us so we must make one and store it
      // for later use.
      return opts.noTokenHandler().then(function(arg) {
         // Create the token when our special note
         var p = $http({
            method: 'POST',
            url:    'https://api.github.com/authorizations',
            data: {
               note: auth_key
            },
            headers: {
               Authorization: 'Basic ' + window.btoa(opts.username + ':' + opts.password)
            }
         });

         return p.then(function(res) {
            var token = res.data.token;
            // Store the token so that we can find it later
            setAuthToken(token, opts.remember);
            // Resolve the promise with the token
            return token;
         });
      });
   };

   this._onLoginError = function(res) {
      console.warn('login error');
   };
})

;
