/**
 * Get Raphael Bboxes.
 * TODO(kashomon): Remove this now that we're using D3.
 */
glift.displays.gui.getRaphaelBboxes = function(robjects) {
  var outBboxes = [];
  for (var i = 0; i < robjects.length; i++) {
    outBboxes.push(robjects[i].getBBox());
  }
  return outBboxes;
};

/**
 * Apply a set of transforms to a Raphael object.
 * TODO(kashomon): Remove this now that we're using D3.
 */
glift.displays.gui.applyTransforms = function(transforms, robjects) {
  for (var i = 0; i < transforms.length; i++) {
    var obj = robjects[i];
    obj.transform(glift.displays.gui.scaleAndMove(
        obj.getBBox(), transforms[i]));
  }
};

/**
 * Get the scaling string based on the raphael bbox and the scaling object.
 * This scales the object, with the scale centered at the top left.
 *
 * The scaleObject looks like the following:
 *  {
 *    xScale: num,
 *    yScale: num,
 *    xMove: num,
 *    yMove
 *  }
 */
glift.displays.gui.scaleAndMove = function(objBbox, scaleObj) {
  return 's' + scaleObj.xScale + ',' + scaleObj.yScale +
      ',' + objBbox.x + ',' + objBbox.y +
      'T' + scaleObj.xMove + ',' + scaleObj.yMove;
};
