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
   * Provide scrolling, but only for the inner div.  Prepare for nastiness.
   * It's not totally clear that this is the right UX experience.  For boards
   * that don't over flow, it's actually kind of obnoxious.
   */
  // TODO(kashomon): This isn't used currently.  Probably should be removed.
  onlyInnerVertScroll: function(elem, bbox) {
    var preventScroll = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        ev.returnValue = false;
    };

    elem.on('mousewheel', function(e) {
      var el = elem.el;
      var deltaY = e.deltaY;
      var scrollTop = el.scrollTop;
      var scrollHeight = el.scrollHeight;
      var height = bbox.height();
      // Delta is positive if scrolling down and negative if scrolling up.
      var positiveDelta = deltaY > 0; // for IE

      var actualScroll = scrollTop + height;
      // console.log('dy:' + deltaY + ',h:' + height
          // + ',scrollTop:' + scrollTop + ',scrollHeight:' + scrollHeight);
      if (!positiveDelta && deltaY + scrollTop < 0) {
        el.scrollTop = 0;
        preventScroll(e);
      } else if (positiveDelta > scrollHeight - actualScroll) {
        el.scrollTop = scrollHeight - height;
        preventScroll(e);
      }
      return this;
    });
  },

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
