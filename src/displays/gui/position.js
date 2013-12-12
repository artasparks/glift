/**
 * Get the scaling string based on the raphael bbox and the scaling object.
 * This scales the object, with the scale centered at the top left.
 *
 * The arguments ar a scaling object and an object bounding box.
 *
 * The Bounding Box is the original bounding box.  It's used to specify the
 * center of the scale operation.
 *
 * The scaleObject looks like the following:
 *  {
 *    scale: num,
 *    xMove: num,
 *    yMove: num
 *  }
 *
 * Returned is the transformation string. To apply, one only needs to set the
 * transform attribute on the SVG element, e.g.,
 *    d3.select('foo').attr('transform', transformString);
 */
glift.displays.gui.scaleAndMoveString = function(scaleObj) {
  return 'translate(' + scaleObj.xMove + ',' + scaleObj.yMove + ') ' +
    'scale(' + scaleObj.scale + ')';
};
