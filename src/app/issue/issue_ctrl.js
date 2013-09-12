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

      /** Return true if the given label is enabled on our issue.
      */
      isLabelEnabled: function(labelName) {
         return _.contains(this.issue.tr_label_names, labelName);
      },

      /**
      * Toggle the state of the given label.
      */
      toggleLabel: function(labelObj) {
         var enable = !this.isLabelEnabled(labelObj.name);

         // Set label names locally so we can short-circut the roundtrip to github
         if(enable) {
            this.issue.labels.push(labelObj);
            this.issue.tr_label_names.push(labelObj.name);
         } else {
            this.issue.labels = _.filter(this.issue.labels, function(label) {
               return label.name !== labelObj.name;
            });
            this.issue.tr_label_names = _.without(this.issue.tr_label_names, labelObj.name);
         }

         // Push change to github
         gh.updateIssue(trRepoModel.owner, trRepoModel.repo,
                        this.issue.number, {labels: this.issue.tr_label_names}).then(
            function(result) {
               console.log('assignment: success');
            }
         );
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
      * Popup dialog to allow converting issue to pull.
      */
      convertToPull: function() {
         var modal_scope = $rootScope.$new();

         modal_scope.issue = this.issue;

         var opts = {
            scope        : modal_scope,
            windowClass  : 'convert_to_pull_modal',
            backdrop     : true,
            keyboard     : true,
            templateUrl  : "issue/convert_to_pull.tpl.html"
         };
         $modal.open(opts);
      },

      /*
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
      },

      /**
      * Assign the issue to a milestone given the milestone's number
      */
      assignMilestone: function(msNumber) {
         console.log('assigned milestone: ' + msNumber);
         var new_milestone = null;

         // short-circut so we see locally.
         if(msNumber) {
            new_milestone = _.find(trRepoModel.milestones, function(ms) {
               return ms.number === msNumber;
            });
         }
         this.issue.milestone = new_milestone;

         // tell github about the update
         gh.updateIssue(trRepoModel.owner, trRepoModel.repo,
                        this.issue.number, {milestone: msNumber})
            .then(function(result) {
               console.log('assign milestone: success');
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

