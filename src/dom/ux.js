goog.provide('glift.dom.ux');

// Note to self: common vendor property patterns:
//
// -webkit-property => webkitProperty
// -moz-property => MozProperty
// -ms-property => msProperty
// -o-property => OProperty
// property => property


/**
 * Miscellaneous utility methods for UX.
 */
glift.dom.ux = {
  /**
   * Sets a div (or other element), as not selectable.
   */
  setNotSelectable: function(id) {
    glift.dom.elem(id).css({
      'webkitTouchCallout': 'none',
      'webkitUserSelect': 'none',
      'MozUserSelect': 'moz-none',
      'msUserSelect': 'none',
      'user-select': 'none',
      'webkitHighlight': 'none',
      'webkitTapHighlightColor': 'rgba(0,0,0,0)',
      'cursor': 'default'
    });
  }
};
