/* jshint bitwise: false */

angular.module('Trestle')

/** Helper to wrap cache for information about issues.
*/
.service('trIssueCache', function() {
   // We will use issue number as the id
   var lastViewStore = depot('lastViews', {idAttribute: 'number'});

   /** String hash code. */
   function hashCode(str){
     var hash = 0,
         alpha, i;

     if (str.length === 0) {
        return hash;
     }
     for (i = 0; i < str.length; i+=1) {
        alpha = str.charCodeAt(i);
        hash = ((hash<<5)-hash) + alpha;
        hash = hash & hash; // Convert to 32bit integer
     }
     return hash;
   }

   /** Build the set of data we want to store about last view. */
   this.buildViewData = function(issue) {
      return {
         number       : issue.number,
         commentCount : issue.comments,
         isPull       : !!issue.tr_pull_details,
         pullComments : issue.tr_review_comments,
         pullHead     : (issue.tr_pull_details ? issue.tr_pull_details.tr_head.sha : null),
         bodyHash     : hashCode(issue.body),
         titleHash    : hashCode(issue.title)
      };
   };

   /**
   * Return last viewed information
   */
   this.getLastViewedData = function(issue) {
      return lastViewStore.get(issue.number);
   };

   /**
   * Set last viewed time to now.
   * @return Copy of the last view data record.
   */
   this.setLastViewedData = function(issue) {
      var view_data = this.buildViewData(issue);
      lastViewStore.save(view_data);
      return view_data;
   };

})

;
