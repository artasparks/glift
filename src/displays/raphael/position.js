glift.displays.raphael.rowCenter = function(
    outerBox, rapBboxes, vertMargin, horzMargin, minSpacing, maxSpacing) {
  var inBboxes = [];
  for (var i = 0; i < rapBboxes.length; i++) {
    inBboxes[i] = glift.displays.fromRaphaelBbox(rapBboxes[i]);
  }
  return glift.displays.rowCenter(
      outerBox, inBboxes, vertMargin, horzMargin, minSpacing, maxSpacing);
};

glift.displays.raphael.getBboxes = function(robjects) {
  var outBboxes = [];
  for (var i = 0; i < robjects.length; i++) {
    outBboxes.push(robjects[i].getBBox());
  }
  return outBboxes;
};

glift.displays.raphael.applyTransforms = function(transforms, robjects) {
  for (var i = 0; i < transforms.length; i++) {
    var obj = robjects[i];
    obj.transform(glift.displays.raphael.scaleAndMove(
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
glift.displays.raphael.scaleAndMove = function(objBbox, scaleObj) {
  return 's' + scaleObj.xScale + ',' + scaleObj.yScale +
      ',' + objBbox.x + ',' + objBbox.y +
      'T' + scaleObj.xMove + ',' + scaleObj.yMove;
};
