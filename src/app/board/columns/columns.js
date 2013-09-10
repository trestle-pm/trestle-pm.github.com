angular.module('Trestle.board')

.controller('ColumnsCtrl', function($scope, trRepoModel) {
   this.getColumnWidth = function() {
      var config      = trRepoModel.config,
          num_columns = config ? config.columns.length : 0;

      if($scope.showBacklog) {
         num_columns += 1;
      }

      return { width: (100.0 / num_columns) + '%'};
   };

})

;
