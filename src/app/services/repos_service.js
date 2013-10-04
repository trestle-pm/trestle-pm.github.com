/* jshint -W072 */

angular.module('Trestle')

.service('trRepoModel', function($rootScope) {
   var scope = $rootScope.$new();

   // Set some defaults for the application
   scope.owner  = null;
   scope.repo   = null;
   scope.config = null;

   // repository state
   scope.issues      = [];
   scope.milestones  = [];
   scope.repoDetails = null;
   scope.assignees   = [];
   scope.labels      = [];

   // Helper to use when you want a pretty name for the repository
   scope.getFullRepoName = angular.bind(this, function() {
      if (scope.repo && scope.owner) {
         return [scope.owner, scope.repo].join('/');
      }

      return null;
   });

   return scope;
})

/**
 * Service to hold information about the repository that we are
 * connected to and using.
*/
.service('trReposSrv', function($modal, $q, gh, $stateParams, issueWatchSrv,
                                buildStatusWatchSrv, trRepoModel, trIssueHelpers, auth) {
   var TRESTLE_CONFIG_TITLE = 'TRESTLE_CONFIG',
       DEFAULT_CONFIG = {
          "columns": ["In Progress", "Review", "CI", "Ship"],
          "wip_limit": 10,
          // Map from column name/label to int limit, defaults to wip_limit
          "wip_limits": {}
       };

   this.refreshSettings = function(stateParams) {
      stateParams = stateParams || $stateParams;

      // Cancel any previous watchers
      issueWatchSrv.stop();
      buildStatusWatchSrv.stop();

      trRepoModel.owner = stateParams.owner;
      trRepoModel.repo  = stateParams.repo;

      if(!trRepoModel.config) {
         trRepoModel.config = angular.copy(DEFAULT_CONFIG);
      }

      if(!auth.getAuthToken()) {
         console.warn('trReposSrv:refreshSettings: no auth token, skipping');
      }

      // Spawn off the configuration loading
      var has_repo = trRepoModel.owner && trRepoModel.repo;
      if( has_repo && auth.getAuthToken()) {
         issueWatchSrv.start();
         buildStatusWatchSrv.start();

         return $q.all([
            this._loadConfig(),
            this._loadIssues(),
            this._loadMilestones(),
            this._loadRepoDetails(),
            this._loadAssignees(),
            this._loadLabels()
         ]);
      }
      else {
         // Return an empty deferred so that callers can connect to the methods
         // result no matter what.
         var done = $q.defer();
         done.resolve(true);
         return done.promise;
      }
   };

   this.stop = function() {
      issueWatchSrv.stop();
      buildStatusWatchSrv.stop();
   };

   this._loadIssues = function() {
      return gh.listRepoIssues(trRepoModel.owner, trRepoModel.repo)
         .then(function(issues) {
            trRepoModel.issues = issues;
         });
   };

   this._loadMilestones = function() {
      return gh.listMilestones(trRepoModel.owner, trRepoModel.repo)
         .then(function(milestones) {
            trRepoModel.milestones = milestones;
         });
   };

   this._loadLabels = function() {
      return gh.listLabels(trRepoModel.owner, trRepoModel.repo)
         .then(function(labels) {
            trRepoModel.labels = labels;
         });
   };

   this._loadRepoDetails = function() {
      return gh.getRepos(trRepoModel.owner, trRepoModel.repo)
         .then(function(repos) {
            trRepoModel.repoDetails = repos;
         });
   };

   /**
   * Load all assignees on this repository.
   */
   this._loadAssignees = function() {
      return gh.listRepoAssignees(trRepoModel.owner, trRepoModel.repo)
         .then(function(assignees) {
            trRepoModel.assignees = assignees;
         });
   };

   /**
   * Load the configuration from the Trestle issue ticket.
   *
   * Q: How should we handle case where we don't end up with a config?
   */
   this._loadConfig = function() {
      var me = this;

      // Called when there is no configuration found and we need to handle that.
      //
      // Returns true if the user chose to create a configuration and we created it.
      function promptToCreateConfig() {
         var deferred = $q.defer();

         // Prompt to see if the user wants to create config
         var prompt = $modal.open({
            templateUrl : 'services/missing_config_dialog.tpl.html',
            backdrop    : 'static',
            keyboard    : false
         });
         prompt.result.then(function(result) {
            if('create' === result) {
               console.log('Creating configuration...');
               create_config();  // resolve the deferred internally
            } else {
               console.log('Skipping config creation');
               deferred.resolve(false);
            }
         });

         // Helper method to create configuration issue
         function create_config() {
            gh.createIssue(trRepoModel.owner, trRepoModel.repo,
                           TRESTLE_CONFIG_TITLE, JSON.stringify(DEFAULT_CONFIG))
               .then(function(result_issue) {
                  console.log('issue created');
                  gh.updateIssue(trRepoModel.owner, trRepoModel.repo,
                                 result_issue.number, {state: 'closed'}).then(
                     function(result_patch) {
                        deferred.resolve(true);
                     }
                  );
               },
               function(err) {
                  console.error('Failed to create config issue');
                  deferred.resolve(false);
               }
            );
         }

         return deferred.promise;
      }

      // Attempt to lookup the configuration issue for this repository
      // - If found, then set it and continue
      // - If not, then prompt to create and try loading it again
      return me._readConfig().then(
         function(configResult) {
            if(null !== configResult) {
               console.log('config loaded');
               trRepoModel.config = configResult;
            }
            // No config, so prompt to create one
            else {
               promptToCreateConfig().then(
                  function(created_config) {
                     if(created_config) {
                        me._loadConfig();
                     } else {
                        console.log('proceeding with no config');
                     }
                  }
               );
            }
         },
         function() {
            // todo: handle this case by fixing up configuration.
            console.error('Error reading config');
         }
      );
   };

   /**
   * Returns a promise that is resolved with the current configuration for
   * the repository or null if not found.
   * It is rejected if the config fails to parse.
   */
   this._readConfig = function() {
      var read_deferred = $q.defer(),
          conf          = {};

      gh.searchIssues({title: TRESTLE_CONFIG_TITLE}).then(function(configIssues) {
         // Filter the search results to only this repo since the API does
         // not allow that.
         var matcher = new RegExp(trRepoModel.owner + '\/' + trRepoModel.repo);
         var config_issue = _.findWhere(configIssues.items, function(issue) {
            return matcher.test(issue.url);
         });

         // Issue not found
         if(undefined === config_issue) {
            read_deferred.resolve(null);
         } else {
            // Try and parse the issues body as the configuration blob
            try {
               conf = JSON.parse(config_issue.body);
               read_deferred.resolve(conf);
            } catch (err) {
               console.error('Invalid JSON for configuration issues body');
               read_deferred.reject('JSON parse error');
            }
         }
      },
      // error
      function() {
         read_deferred.resolve(null);
      });

      return read_deferred.promise;
   };

});
