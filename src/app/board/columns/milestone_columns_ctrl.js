angular.module('Trestle.board')

/**
* Controller for managing the milestones columns page.
*/
.controller('MilestoneColumnsCtrl', function($scope, trRepoModel) {
   $scope.$id = "MilestoneColumnsCtrl:" + $scope.$id;

   /**
   * Return the width to use for the columns.
   * - take into account the extra column for 'no milestone'
   */
   this.getColumnWidth = function() {
      var num_columns = trRepoModel.milestones ? trRepoModel.milestones.length : 0;

      return { width: (100.0 / (num_columns + 1) ) + '%'};
   };

})

;
