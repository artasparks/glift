(function() {
glift.displays.cropbox = {
  LINE_EXTENSION: .5,
  DEFAULT_EXTENSION: 0,
  OVERFLOW: 1.5, // The line spacing that goes around the edge.

  getFromRegion: function(region, intersects) {
    var util = glift.util,
        boardRegions = enums.boardRegions,
        region = region || boardRegions.ALL,
        // So that we can 0 index, we subtract one.
        maxIntersects = intersects - 1,
        minIntersects = 0,
        defaultExtension = 0,
        lineExtension = .5,
        halfInts = Math.ceil(maxIntersects / 2),

        // Assign Defualts
        top = minIntersects,
        left = minIntersects,
        bot = maxIntersects,
        right = maxIntersects,
        topExtension = this.DEFAULT_EXTENSION,
        leftExtension = this.DEFAULT_EXTENSION,
        botExtension = this.DEFAULT_EXTENSION,
        rightExtension = this.DEFAULT_EXTENSION;

    switch(region) {
      // X X
      // X X
      case boardRegions.ALL: break;

      // X -
      // X -
      case boardRegions.LEFT:
          right = halfInts + 1;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - X
      case boardRegions.RIGHT:
          left = halfInts - 1;
          leftExtension = this.LINE_EXTENSION;
          break;

      // X X
      // - -
      case boardRegions.TOP:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X X
      case boardRegions.BOTTOM:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          break;

      // X -
      // - -
      case boardRegions.TOP_LEFT:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          right = halfInts + 2;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - -
      case boardRegions.TOP_RIGHT:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          left = halfInts - 2;
          leftExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X -
      case boardRegions.BOTTOM_LEFT:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          right = halfInts + 2;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - -
      // - X
      case boardRegions.BOTTOM_RIGHT:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          left = halfInts - 2;
          rightExtension = this.LINE_EXTENSION;
          break;
      default: break;
    };

    var cbox = glift.displays.bboxFromPts(
        util.point(left, top), util.point(right, bot));
    cbox.minIntersects = minIntersects;
    cbox.maxIntersects = maxIntersects;
    cbox.extensionBox = glift.displays.bboxFromPts(
        util.point(leftExtension, topExtension),
        util.point(rightExtension, botExtension)),
    cbox.xPoints = cbox.width;
    cbox.yPoints = cbox.height;
    // A modification to the width for the purposes of making the ratio work
    // out.
    // TODO: Rename the cbox.width/height, since they are different than normal
    // widths / heights.
    cbox.width = cbox.width + leftExtension + rightExtension + this.OVERFLOW;
    cbox.height = cbox.height + topExtension + botExtension + this.OVERFLOW;
    return cbox;
  },

  // Change the dimensions of the box (the height and width) to have the same
  // proportions as cropHeight / cropWidth;
  getCropDimensions: function(width, height, cropbox) {
    var origRatio = height / width,
        cropRatio = cropbox.height / cropbox.width,
        newHeight = height,
        newWidth = width;
    if (origRatio > cropRatio) {
      newHeight = width * cropRatio;
    } else if (origRatio < cropRatio) {
      newWidth = height / cropRatio;
    }
    return {
      height: newHeight,
      width: newWidth
    };
  },

  getCropRegion: function(movetree) {
    var bbox = glift.displays.bboxFromPts,
        point = glift.util.point,
        boardRegions = glift.enums.boardRegions,
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
    return getRegionFromTracker(tracker, numstones);
  }
};

var getRegionFromTracker = function(tracker, numstones) {
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
    // Shouldn't be 1 element here...
    return glift.boardRegions.ALL;
  }
  var newset = glift.util.intersection(
    glift.util.regions.getComponents(regions[0]),
    glift.util.regions.getComponents(regions[1]));
  // there should only be one element at this point or nothing
  for (var key in newset) {
    return key;
  }
  return glift.boardRegions.ALL;
}

})();
