angular.module('Trestle.issue')

.filter('assignedUser', function() {
   return function(issue) {
      var assignee = issue.assignee,
          default_url = 'http://www.gravatar.com/avatar/0?d=mm&f=y&s=';

      return {
         name:       assignee ? assignee.login      : 'no one',
         avatar_url: assignee ? assignee.avatar_url : default_url
      };
   };
})

.filter('isPullRequest', function() {
   return function(issue) {
      return issue.pull_request && issue.pull_request.html_url;
   };
})

/** Return status of build.
 * - "pending", "success", "failure", "error", "unknown"
 */
.filter('buildStatus', function() {
   return function(issue) {
      return (issue.tr_top_build_status || {}).state || 'unknown';
   };
})

/**
 * Return the build status text for the pull.
 **/
.filter('buildStatusText', function($filter) {
   return function(issue) {
      var text   = "",
          status = $filter('buildStatus')(issue);

      if(status === "unknown") {
         text = "Build not started";
      } else if(status === "success") {
         text = "Built successfully";
      } else if(status === "failure") {
         text = "Failed: " + issue.tr_top_build_status.description;
      } else {
         text = issue.tr_top_build_status.description;
      }

      return text;
   };
})

/**
 * Return a obj of user details suitable for use in templates.
 */
.filter('userDetails', function() {
   return function(user, avSize) {
      avSize = avSize || 30;

      if(user) {
         return {
            name       : user.login,
            avatar_url : user.avatar_url + "?s=" + avSize
         };
      } else {
         return {
            name       : 'no one',
            avatar_url : 'http://www.gravatar.com/avatar/0?d=mm&f=y&s=' + avSize
         };
      }
   };
})

/** Return true if the given label is enabled on our issue.
 */
.filter('contains', function() {
   return function(labels, labelName) {
      return _.contains(labels, labelName);
   };
})

;
