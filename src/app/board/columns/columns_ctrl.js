angular.module('Trestle.board')

.controller('ColumnsCtrl', function($scope, trRepoModel) {
   $scope.$id = "ColumnsCtrl:" + $scope.$id;

   this.getColumnWidth = function() {
      var config      = trRepoModel.config,
          num_columns = config ? config.columns.length : 0;

      return { width: (99.0 / num_columns) + '%'};
   };

   /** Return a list of objects
   * describe the milestones to be used for selection.
   *
   * note: we don't do this in the template because we have two "empty" options.
   */
   this.getMilestoneSelectOptions = function() {
      return [
         { value: '*', title: 'Any Milestone' },
         { value: 'none', title: 'No Milestone' }
      ].concat(_.map(trRepoModel.milestones, function(ms) {
            return { value: ms.title, title: ms.title };
         })
      );
   };


})

;
