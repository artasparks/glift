glift.bridge.getFromMovetree = function(movetree) {
  var bbox = glift.displays.bboxFromPts,
      point = glift.util.point,
      boardRegions = glift.enums.boardRegions,
      // Intersections need to be 0 rather than 1 indexed.
      ints = movetree.getIntersections() - 1,
      middle = Math.ceil(ints / 2),
      quads = {},
      tracker = {},
      numstones = 0;
  quads[boardRegions.TOP_LEFT] =
      bbox(point(0, 0), point(middle + 1, middle + 1));
  quads[boardRegions.TOP_RIGHT] =
      bbox(point(middle - 1, 0), point(ints, middle + 1));
  quads[boardRegions.BOTTOM_LEFT] =
      bbox(point(0, middle - 1), point(middle + 1, ints));
  quads[boardRegions.BOTTOM_RIGHT] =
      bbox(point(middle - 1, middle - 1), point(ints, ints));
  movetree.recurseFromRoot(function(mt) {
    var stones = mt.getProperties().getAllStones();
    for (var color in stones) {
      var points = stones[color];
      for (var i = 0; i < points.length; i++) {
        var pt = points[i];
        numstones += 1
        for (var quadkey in quads) {
          var box = quads[quadkey];
          if (box.contains(pt)) {
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
    if (quadlist.length === numstones) {
      return quadkey;
    } else {
      regions.push(quadkey);
    }
  }
  if (regions.length !== 2) {
    return glift.boardRegions.ALL; // Shouldn't be 1 element here...
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
