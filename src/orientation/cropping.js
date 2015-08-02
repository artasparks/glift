/**
 * Takes a movetree and returns the optimal BoardRegion-Quad for cropping purposes.
 *
 * Note: This isn't a minimal cropping: we split the board into 4 quadrants.
 * Then, we use the quad as part of the final quad-output. 
 *
 * Note: that we only allow convex shapes for obvious reasons.  Thus, these
 * aren't allowed (where the X's are quad-regions)
 * .X     X.
 * X. and XX
 */
glift.orientation.getQuadCropFromMovetree = function(movetree) {
  var bbox = glift.displays.bbox.fromPts;
  var pt = glift.util.point;
  var boardRegions = glift.enums.boardRegions;
  // Intersections need to be 0 rather than 1 indexed for this method.
  var ints = movetree.getIntersections() - 1;
  var middle = Math.ceil(ints / 2);

  // Tracker is a map from quad-key to array of points.
  var tracker = {};
  var numstones = 0;

  // It's not clear to me if we should be cropping boards smaller than 19.  It
  // usually looks pretty weird, so hence this override.
  if (movetree.getIntersections() !== 19) {
    return boardRegions.ALL;
  }

  var quads = {};
  quads[boardRegions.TOP_LEFT] = bbox(pt(0, 0), pt(middle, middle));
  quads[boardRegions.TOP_RIGHT] = bbox(pt(middle, 0), pt(ints, middle));
  quads[boardRegions.BOTTOM_LEFT] = bbox(pt(0, middle), pt(middle, ints));
  quads[boardRegions.BOTTOM_RIGHT] = bbox(pt(middle, middle), pt(ints, ints));

  movetree.recurseFromRoot(function(mt) {
    var stones = mt.properties().getAllStones();
    for (var color in stones) {
      var points = stones[color];
      for (var i = 0; i < points.length; i++) {
        var pt = points[i];
        numstones += 1
        for (var quadkey in quads) {
          var box = quads[quadkey];
          if (middle === pt.x() || middle === pt.y()) {
            // Ignore points right on the middle.  It shouldn't make a different
            // for cropping, anyway.
          } else if (box.contains(pt)) {
            if (tracker[quadkey] === undefined) tracker[quadkey] = [];
            tracker[quadkey].push(pt);
          }
        }
      }
    }
  });
  return glift.orientation._getRegionFromTracker(tracker, numstones);
};

glift.orientation._getRegionFromTracker = function(tracker, numstones) {
  var regions = [], br = glift.enums.boardRegions;
  for (var quadkey in tracker) {
    var quadlist = tracker[quadkey];
    regions.push(quadkey);
  }
  if (regions.length === 1) {
    return regions[0];
  }
  if (regions.length !== 2) {
    return glift.enums.boardRegions.ALL;
  }
  var newset = glift.util.intersection(
    glift.util.regions.getComponents(regions[0]),
    glift.util.regions.getComponents(regions[1]));
  // there should only be one element at this point or nothing
  for (var key in newset) {
    return key;
  }
  return glift.enums.boardRegions.ALL;
};

