/**
 * Enhances the angular bootstrap directive to allow it to stay open when the
 * user clicks inside the menu.
 *
 * Add 'no-close' class to any direct children of dropdown-menu that
 * should not get clicked on.
 */
angular.module('ui.bootstrap.dropdownToggleNoClose', []).directive('dropdownToggleNoClose',
  ['$document', '$location', '$window', function ($document, $location, $window) {
  var openElement = null,
      closeMenu   = angular.noop;

  return {
     restrict: 'CA',

     link: function(scope, element, attrs) {
        // close the menu if the route changes
        scope.$watch('$location.path', function() { closeMenu(); });
        element.parent().bind('click', function() { closeMenu(); });

        element.bind('click', function(event) {
           // Do not cascade up to the parent since that would close the menu
           event.preventDefault();
           event.stopPropagation();

           var elementWasOpen = (element === openElement);
           if (!!openElement) {
              closeMenu();
           }

           if (!elementWasOpen){
              element.parent().addClass('open');
              openElement = element;
              closeMenu = function (event) {
                 if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                 }
                 $document.unbind('click', closeMenu);
                 element.parent().removeClass('open');
                 closeMenu   = angular.noop;
                 openElement = null;
              };
           }

           // When the document is clicked close the menu
           $document.bind('click', closeMenu);
        });

        // But allow clicking in the menu itself
        angular.forEach(element.parent().children(), function(node) {
           var elm = angular.element(node);
           if (elm.hasClass('dropdown-menu')) {
              angular.forEach(elm.children(), function(child) {
                 var child_elt = angular.element(child);

                 if(child_elt.hasClass('no-close')) {
                    child_elt.bind('click', function(event) {
                       // Stop the event so that the close menu above is not triggered
                       event.preventDefault();
                       event.stopPropagation();
                       return false;
                    });
                 }

              });
           }
        });
     }
  };
}]);
