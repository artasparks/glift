/**
 * Takes a movetree and returns the optimal BoardRegion for cropping purposes.
 */
glift.bridge.getCropFromMovetree = function(movetree) {
  var bbox = glift.displays.bboxFromPts;
  var point = glift.util.point;
  var boardRegions = glift.enums.boardRegions;
  // Intersections need to be 0 rather than 1 indexed for this method.
  var ints = movetree.getIntersections() - 1;
  var middle = Math.ceil(ints / 2);

  // Quads is a map from BoardRegion to the points that the board region
  // represents.
  var quads = {};

  // Tracker is a mapfrom 
  var tracker = {};
  var numstones = 0;

  // TODO(kashomon): Reevaluate this later.  It's not clear to me if we should
  // be cropping boards smaller than 19.  It usually looks pretty weird.
  if (movetree.getIntersections() !== 19) {
    return glift.enums.boardRegions.ALL;
  }
  quads[boardRegions.TOP_LEFT] =
      bbox(point(0, 0), point(middle, middle));
  quads[boardRegions.TOP_RIGHT] =
      bbox(point(middle, 0), point(ints, middle));
  quads[boardRegions.BOTTOM_LEFT] =
      bbox(point(0, middle), point(middle, ints));
  quads[boardRegions.BOTTOM_RIGHT] =
      bbox(point(middle, middle), point(ints, ints));
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
  return glift.bridge._getRegionFromTracker(tracker, numstones);
};

glift.bridge._getRegionFromTracker = function(tracker, numstones) {
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
  return glift.boardRegions.ALL;
};
