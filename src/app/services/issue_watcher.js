angular.module('Trestle')


.service('intervalRunner', function($timeout, gh) {
   function IntervalRunner(interval, func) {
      this._func     = func;
      this._interval = interval * 1000;

      this.lastUpdate      = null;
      this._timeoutPromise = null;
   }

   _.extend(IntervalRunner.prototype, {
      start: function() {
         // Assume the issue list is up to date right now (ie. it is up to date)
         this.lastUpdate = new Date();

         // After interval check for updates
         this._scheduleUpdate();
      },

      stop: function() {
         // Stop asking for new data
         if (this._timeoutPromise) {
            $timeout.cancel(this._timeoutPromise);
         }
         this._timeoutPromise = null;
      },

      _scheduleUpdate: function() {
         this._timeoutPromise = $timeout(angular.bind(this, this._onUpdate),
                                         this._interval);
      },

      _onUpdate: function() {
         // Update the last query time
         // - it seems weird to do this before we get the result but if we wait
         //   then the time would miss the in flight time for the query and possibly
         //   miss issue updates.
         this.lastUpdate = new Date();

         return this._func()
            .finally(angular.bind(this, this._scheduleUpdate));
      }
   });

   return {
      get: function(interval, func) {
         return new IntervalRunner(interval, func);
      }
   };
})


.service('buildStatusWatchSrv', function($q, gh, intervalRunner, trIssueHelpers, trRepoModel) {
   function onUpdateBuildStatus() {
      var pulls = _.filter(trRepoModel.issues, function(issue) {
         return issue.pull_request && issue.pull_request.html_url;
      });

      return $q.all(_.map(pulls, trIssueHelpers.updateBuildStatus));
   }

   var runner = intervalRunner.get(30, onUpdateBuildStatus);
   return runner;
})


.service('issueWatchSrv', function($timeout, $q, gh, intervalRunner, trRepoModel) {
   function getIssueUpdates() {
      // Get the issues updated since our last query
      var params = {
         state: 'open',
         sort: 'updated',
         since: runner.lastUpdate.toISOString()
      };

      return gh.listRepoIssues(trRepoModel.owner, trRepoModel.repo, params)
         .then(function(updatedIssues) {
            _.each(updatedIssues, function(issue) {
               // There is no need to resolve the issues here using
               // `trIssueHelpers.resolveIssueFields` because the hook will
               // fire already.

               // Update the issue in place
               var issue_idx = _.findIndex(trRepoModel.issues, function(oldIssue) {
                  return oldIssue.number === issue.number;
               });

               if (issue_idx > -1) {
                  trRepoModel.issues[issue_idx] = issue;
               }
               else {
                  // The issue was added
                  trRepoModel.issues.push(issue);
               }
            });

            return updatedIssues;
         });
   }

   function getClosedIssues() {
      // Get the issues updated since our last query
      var params = {
         state: 'closed',
         sort:  'updated',
         since: runner.lastUpdate.toISOString()
      };

      return gh.listRepoIssues(trRepoModel.owner, trRepoModel.repo, params)
         .then(function(closedIssues) {
            _.each(closedIssues, function(issue) {
               // Find the issue
               var issue_idx = _.findIndex(trRepoModel.issues, function(oldIssue) {
                  return oldIssue.number === issue.number;
               });

               if (issue_idx > -1) {
                  trRepoModel.issues.splice(issue_idx, 1);
               }
            });

            return closedIssues;
         });
   }

   var runner = intervalRunner.get(30, function () {
      return $q.all([getIssueUpdates(), getClosedIssues()]);
   });
   return runner;
})

;
