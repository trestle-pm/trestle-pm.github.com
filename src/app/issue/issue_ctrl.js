var mod = angular.module('Trestle.issue', []);

mod.controller('IssueCtrl', function($scope, $modal, $rootScope, trRepoModel, gh) {
   // init

   _.extend(this, {
      init: function(issue) {
         this.issue = issue;
         $scope.$id = "IssueCtrl:" + issue.number + $scope.$id;
      },

      isPullRequest: function() {
         return this.issue.pull_request && this.issue.pull_request.html_url;
      },

      /** Return status of build.
      * - "pending", "success", "failure", "error", "unknown"
      */
      getBuildStatus: function() {
         var status = "unknown";
         if(this.issue.tr_top_build_status) {
            status = this.issue.tr_top_build_status.state;
         }
         return status;
      },

      /**
      * Return a obj of user details suitable for use in templates.
      */
      getAssignedUserDetails: function(avSize) {
         avSize = avSize || 30;

         if(this.issue.assignee) {
            return {
               name       : this.issue.assignee.login,
               avatar_url : this.issue.assignee.avatar_url + "?s=" + avSize
            };
         } else {
            return {
               name       : 'no one',
               avatar_url : 'http://www.gravatar.com/avatar/0?d=mm&f=y&s=' + avSize
            };
         }
      },

      /**
      * Return the label names for the issue.
      * by default we strip out the issue columns from this list.
      *
      *  config:
      *    - stripCols: <bool>  If true strip the column labels.
      */
      getLabels: function(config) {
         config = _.defaults({}, config, {
            stripCols: true
         });

         var col_labels = trRepoModel.config.columns;
         var labels = this.issue.labels.slice(0);

         if(config.stripCols) {
            labels = _.filter(labels, function(label) {
               return !_.contains(col_labels, label.name);
            });
         }
         return labels;
      },

      showIssueDetails: function() {
         // Create a local scope for the template and add the issue into it
         var modal_scope = $rootScope.$new();
         modal_scope.$id = "modal:issue_details:" + modal_scope.$id;

         modal_scope.issue = this.issue;
         modal_scope.repoModel = trRepoModel;

         var opts = {
            scope        : modal_scope,
            windowClass  : 'issue_details_modal',
            backdrop     : true,
            keyboard     : true,
            templateUrl  : "issue/issue_details.tpl.html"
         };

         $modal.open(opts);
      },

      /**
      * Called to assign the given user to the issue.
      */
      assignUser: function(user) {
         console.log("Assigning: " + user.login);
         // short-circut locally to get immediate update
         this.issue.assignee = user;

         gh.updateIssue(trRepoModel.owner, trRepoModel.repo,
                        this.issue.number, {assignee: user.login}).then(
            function(result) {
               console.log('assignment: success');
            }
         );
      }
   });

   this.init($scope.$parent.issue);
});

mod.directive('trIssueCard', function() {
   return {
      restrict: 'EA',
      replace: true,
      templateUrl: "issue/issue.tpl.html",
      scope: {
         // XXX: This should allow access in the template but is not for some reason
         //      need to figure this out and make better.
         issue: '=issue'
      }
   };
});

