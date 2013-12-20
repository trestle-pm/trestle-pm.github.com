angular.module('Trestle.board')

.controller('RepoBuildStatusCtrl', function($scope, $timeout, $q, $window, trRepoModel, gh) {
   var branches  = (trRepoModel.config.branch_monitor || {}).global,
       ctrl      = this,
       destroyed = false,
       timeout_p;

   // Name the scope
   $scope.$id = "RepoBuildStatusCtrl:" + $scope.$id;
   // Expose lodash helpers
   $scope._ = _;

   // Build an object with keys as the branch names
   ctrl.branches = _.zipObject(branches, _.map(branches, function() {return null;}));

   /**
    * Helper called when the user selects a build status to view its details.
    */
   ctrl.onShowBuildStatus = function(buildStatus) {
      if (buildStatus && buildStatus.target_url) {
         $window.open(buildStatus.target_url, '_blank');
      }
      else if (buildStatus) {
         $window.alert('The build status does not have a status url');
      }
      else {
         $window.alert('The build status is not known');
      }

   };

   // Called when the scope for this controlle is destroyed so that we can stop
   // updating the build status.
   $scope.$on('$destroy', function cleanup() {
      $timeout.cancel(timeout_p);
      destroyed = true;
   });

   /**
    Helper function which when called downloads the newest build status for the
    monitored branches from GitHub.
    */
   function updateBranchStatuses() {
      // Go get the data for each branch
      var update_deferreds = _.map(branches || [], function(branch) {
         return gh.getStatus(trRepoModel.owner, trRepoModel.repo, branch).
            then(function(ghStatuses) {
               // Sort the build statuses
               var sorted_statuses = _.sortBy(ghStatuses, 'updated_at'), // Old to newer
                   newest_success  = _.findLast(sorted_statuses, {state: 'success'});

               // If there was ever a success report that
               if (newest_success) {
                  ctrl.branches[branch] = newest_success;
               }
               // Otherwise, report the newest there is
               else {
                  ctrl.branches[branch] = _.last(sorted_statuses);
               }
            });
      });

      // Once all the work is done schedule the next update
      $q.all(update_deferreds)
         .then(function() {
            if (! destroyed) {
               timeout_p = $timeout(updateBranchStatuses, 30 * 1000);
            }
         });
   }

   // Go get the current state and start off the looping updates
   updateBranchStatuses();
})

;
