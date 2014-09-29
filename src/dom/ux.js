/**
 * Miscellaneous utility methods for UX.
 */
glift.dom.ux = {
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
  }
};
