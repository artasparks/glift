/**
 * Rotates a movetree so that it's canonical, given some cropbox
 */
glift.bridge.autorotateMovetree = function(movetree, regionOrdering) {
  var rotation = glift.bridge.findCanonicalRotation(movetree, regionOrdering);
  movetree.recurse(function(mt) {
    for (var key in mt.properties().propMap) {
    }
  });
};

/**
 * Calculates the desired rotation. Returns one of
 * glift.enums.rotations.
 */
glift.bridge.findCanonicalRotation = function(movetree, regionOrdering) {
  var boardRegions = glift.enums.boardRegions;
  var rotations = glift.enums.rotations;
  var cornerRegions = {
    TOP_LEFT: 0,
    BOTTOM_LEFT: 90,
    BOTTOM_RIGHT: 180,
    TOP_RIGHT: 270
  };
  var sideRegions = {
    TOP: 0,
    LEFT: 90,
    BOTTOM: 180,
    RIGHT: 270
  };

  if (!regionOrdering) {
    regionOrdering = {
      corner: boardRegions.TOP_RIGHT,
      side: boardRegions.TOP
    };
  }

  var region = glift.bridge.getQuadCropFromMovetree(movetree);

  if (cornerRegions[region] !== undefined ||
      sideRegions[region] !== undefined) {
    var start = 0, end = 0;
    if (cornerRegions[region] !== undefined) {
      start = cornerRegions[region];
      end = cornerRegions[regionOrdering.corner];
    }

    if (sideRegions[region] !== undefined) {
      start = sideRegions[region];
      end = sideRegions[regionOrdering.side];
    }

    var rot = (360 + start - end) % 360;
    if (rot === 0) { return rotations.NO_ROTATION; }
    return 'CLOCKWISE_' + rot;
  }

  // No rotations. We only rotate when the quad crop region is either a corner
  // or a side.
  return rotations.NO_ROTATION;
};
