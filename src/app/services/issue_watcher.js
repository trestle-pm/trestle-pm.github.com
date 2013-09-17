angular.module('Trestle')

.service('issueWatchSrv', function($timeout, $q, gh, trIssueHelpers, trRepoModel) {
   var timeout_promise = null,
       last_update     = null,
       interval        = 15 * 1000;

   function scheduleUpdate() {
      // - false on the end stops the scope digest which for us is fine
      //   since the entire handler is async
      timeout_promise = $timeout(getUpdates, interval, false);
   }

   function getUpdates() {
      var p = $q.all([
         getIssueUpdates(),
         getClosedIssues()
      ]).finally(scheduleUpdate, scheduleUpdate);

      // Update the last query time
      // - it seems weird to do this before we get the result but if we wait
      //   then the time would miss the in flight time for the query and possibly
      //   miss issue updates.
      last_update = new Date();

      return p;
   }

   function getIssueUpdates() {
      // Get the issues updated since our last query
      var params = {
         state: 'open',
         sort: 'updated',
         since: last_update.toISOString()
      };

      return gh.listRepoIssues(trRepoModel.owner, trRepoModel.repo, params)
         .then(function(updatedIssues) {
            // If the watcher was stopped then do nothing since we don't know
            // what the issue list is currently holding.
            if (!timeout_promise) {
               // No issue changes
               return [];
            }

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
         sort: 'updated',
         since: last_update.toISOString()
      };

      return gh.listRepoIssues(trRepoModel.owner, trRepoModel.repo, params)
         .then(function(closedIssues) {
            // If the watcher was stopped then do nothing since we don't know
            // what the issue list is currently holding.
            if (!timeout_promise) {
               // No issue changes
               return [];
            }

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

   this.start = function(checkNow) {
      // Assume the issue list is up to date right now (ie. it is up to date)
      last_update = new Date();

      // After interval check for updates
      scheduleUpdate();
   };

   this.stop = function() {
      // Stop asking for new data
      if (timeout_promise) {
         $timeout.cancel(timeout_promise);
      }
      timeout_promise = null;
   };
})

;
