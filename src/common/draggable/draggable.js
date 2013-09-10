/**
 @ngdoc overview
 @name draggable

 @description
 Provides the basics for drag and dropping of items in an angular application.
 */
angular.module('draggable', [])

.directive('ngDraggable', function($parse) {
   /**
    @ngdoc directive
    @name draggable.ngDraggable

    @description
    Directive which allows an item to be draggable in the interface using HTML5's
    draggable property.
    */
   return {
      // Only allow attributes to cause this directive to be picked up
      restrict: 'A',

      link: function(scope, element, attrs, controller) {
         // Mark the item as draggable
         element.prop('draggable', true);

         // When the drag starts fill in the drag data on the event
         var func = $parse(attrs.ngDraggable);
         element.bind('dragstart', function(event) {
            // Run the function inside a $scope.apply block so that if the
            // scope changes the scope will be reevaluated.
            var handled;
            scope.$apply(function() {
               var res = func(scope, {$event: event});
               handled = (res !== false);
            });

            if (handled) {
               event.dataTransfer.setDragImage(event.srcElement, 0, 0);
            }
         });
      }
   };
})

.directive('ngDropzone', function($parse) {
   return {
      // Only allow attributes to cause this directive to be picked up
      restrict: 'A',

      link: function(scope, element, attrs, controller) {
         //var drag_type = 'move'; // Hardcoded for now since that is all I need

         var func = $parse(attrs.ngDropzone);
         element.bind('dragover', function(event) {
            // Defualt to drop not allowed
            var allow_drop = true;

            scope.$apply(function() {
               allow_drop = func(scope, {$event: event});
            });

            if (!allow_drop) {
               // The event will continue propogating since we do not care
               // about the drop
               event.preventDefault();
            }

            return !allow_drop;
         });

         // { Style the element when the drag is over it
         element.bind('dragenter', function(event) {
            element.addClass('dragging-over');
         });

         element.bind('dragleave', function(event) {
            element.removeClass('dragging-over');
         });
         // }

         var doDropfunc = $parse(attrs.handledrop);
         element.bind('drop', function(event) {
            var handled = false;

            scope.$apply(function() {
               var handled = doDropfunc(scope, {$event: event});
               // Allow the drop func to forget about the return value unless
               // they need to cancel the drop.
               // This is OK since the drop would not happen if the
               // dragenter/over methods had not succeeded.
               handled = (handled !== false);
            });

            if (handled) {
               event.preventDefault();
            }
            return !handled;
         });
      }
   };
})

;
