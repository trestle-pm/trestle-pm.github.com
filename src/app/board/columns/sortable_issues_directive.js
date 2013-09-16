angular.module('Trestle.board')

/**
 @ngdoc directive
 @name Trestle.trIssueSortable

 @description
 */
.directive('trIssueSortable', function($parse, $timeout, trRepoModel) {
   return {
      link: function(scope, element, attrs) {
         // Keep track of the latest sorting events so that the timeout has
         // access to them.
         //var last_evt, last_obj;

         // After the user completes a sorting there are some timing issues with
         // the events, basically the fire to much and too quickly to make sense
         // for our async pass to GitHub.
         // To work around this we buffer the sorting calls into a single one
         /// once things settle down.
         var quite_period = null;

         // Options to pass to JQuery Sortable plugin
         var opts = {
            // Let issues be dragged between any lists with the `column-body`
            // class.  The class must be on the direct parent of the issues.
            connectWith: '.column-body',
            helper:      'clone',
            opacity:     0.8,
            placeholder: 'drop-area'
         };

         // Extract the handler funcstions syntax.
         var on_update = $parse(attrs.trIssueSortable);

         // Helper function used to do event compression
         // This will register the drag and drop operation and fire the handler
         // function once things settle down.
         function scheduleUpdate(evt, obj) {
            // Cache the events
            //last_evt = evt;
            //last_obj = obj;

            // We could reset timeout but the events all happy in one tick so
            // there is not really a reason.
            if (quite_period) {
               return;
            }

            // Schedule a call for later that will tell the handler function
            // that the sort has changed.
            quite_period = $timeout(function() {
               quite_period = null;
               emitUpdate(evt, obj);
            });
         }

         /**
          Helper function called when the user has resorted the list.
          At this point we do not know what event triggered it but we don't
          really care as we only need to tell the handler what issue was moved
          and what issues are currently in the list.
          */
         function emitUpdate(evt, obj) {
            var dom_elm  = $(obj.item),
                issue_id = dom_elm.data('issue-id');

            // Build list of current issues in our DOM
            // This list is better then any list we can get from angular as
            // angular has not been updated yet to know about the issue changes.
            var issues = _.map($(element).children(), function(elm) {
               var _id = $(elm).data('issue-id');
               return _.findWhere(trRepoModel.issues, {id: _id});
            });

            var issue = _.findWhere(issues, {id: issue_id});

            // If the issue is not found that our column was updated due to the
            // issue being moved elsewhere.
            if (!issue) {
               console.log('no issue');
               return;
            }

            // Call the handler
            on_update(scope, {issues: issues, issue: issue});
         }

         // Monitor the sortable plugins end state events
         opts.stop    = scheduleUpdate;
         opts.update  = scheduleUpdate;
         opts.receive = scheduleUpdate;

         // Create sortable (jquery adds this to element)
         element.sortable(opts);
      }
   };
})

;
