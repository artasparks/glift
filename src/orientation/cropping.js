/**
 * Takes a movetree and returns the optimal BoardRegion-Quad for cropping purposes.
 *
 * This isn't a minimal cropping: we split the board into 4 quadrants.
 * Then, we use the quad as part of the final quad-output. 
 *
 * Optionally, we allow a nextMovesPath so that we can 'optimally' crop just a
 * variation.
 *
 * Note: that we only allow convex shapes for obvious reasons.  Thus, these
 * aren't allowed (where the X's are quad-regions)
 * .X     X.
 * X. and XX
 */
glift.orientation.getQuadCropFromMovetree = function(movetree, nextMovesPath) {
  var br = glift.enums.boardRegions;
  var ints = movetree.getIntersections();
  // It's not clear to me if we should be cropping boards smaller than 19.  It
  // usually looks pretty weird, so hence this override.
  if (ints < 19) {
    return br.ALL;
  }

  var minimalBox = glift.orientation.minimalBoundingBox(
      movetree, nextMovesPath);
  var boxMapping = glift.orientation._getCropboxMapping(ints);
  for (var i = 0; i < boxMapping.length; i++) {
    var obj = boxMapping[i];
    if (obj.bbox.covers(minimalBox)) {
      return obj.result;
    }
  }

  throw new Error('None of the boxes cover the minimal bbox!! ' +
      'This should never happen');
};

/**
 * For 19x19, we cache the cropbox mappings. Has the form:
 * [{
 *  bbox: <bbox>
 *  result: BOARD_REGION
 * },{
 *  ...
 * }]
 */
glift.orientation._cropboxMappingCache = null;
/** Gets the cropbox mapping. Only for 19x19 currently */
glift.orientation._getCropboxMapping = function(size) {
  if (size != 19) {
    throw new Error('Only for 19x19');
  }
  var br = glift.enums.boardRegions;
  // See glift.orientation.cropbox for more about how cropboxes are defined.
  var cbox = function(bregion) {
    return glift.orientation.cropbox.get(bregion, 19);
  };

  if (glift.orientation._cropboxMappingCache == null) {
    // The heart of this method. We know the minimal bounding box for the stones.
    // Then the question is: Which bbox best covers the minimal box? There are 4
    // cases:
    // -  The min-box is an 'in-between area'. First check the very middle of the
    //    board. then, check the edge areas.
    // -  The min-box lies within a corner
    // -  The min-box lies within a side
    // -  The min-box can only be covered by the entire board.
    var boxRegions = [
      // Check the overlap regions.
      // First, we check the very middle of the board.
      {
        bbox: cbox(br.TOP_LEFT).bbox.intersect(cbox(br.BOTTOM_RIGHT).bbox),
        result: br.ALL
      // Now, check the side-overlaps.
      }, {
        bbox: cbox(br.TOP_LEFT).bbox.intersect(cbox(br.TOP_RIGHT).bbox),
        result: br.TOP
      }, {
        bbox: cbox(br.TOP_LEFT).bbox.intersect(cbox(br.BOTTOM_LEFT).bbox),
        result: br.LEFT
      }, {
        bbox: cbox(br.BOTTOM_RIGHT).bbox.intersect(cbox(br.TOP_RIGHT).bbox),
        result: br.RIGHT
      }, {
        bbox: cbox(br.BOTTOM_RIGHT).bbox.intersect(cbox(br.BOTTOM_LEFT).bbox),
        result: br.BOTTOM
      }
    ];

    var toAdd = [
      br.TOP_LEFT, br.TOP_RIGHT, br.BOTTOM_LEFT, br.BOTTOM_RIGHT,
      br.TOP, br.BOTTOM, br.LEFT, br.RIGHT,
      br.ALL
    ];
    for (var i = 0; i < toAdd.length; i++) {
      var bri = toAdd[i];
      boxRegions.push({
        bbox: cbox(bri).bbox,
        result: bri
      });
    }
    glift.orientation._cropboxMappingCache = boxRegions;
  }

  return glift.orientation._cropboxMappingCache;
};

