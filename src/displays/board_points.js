(function() {
// TODO(kashomon): Add much better tests for these methods.  The BoardPoints are
// pivotal to creating the go board, so we want them to really work.

/**
 * Simple wrapper around the BoardPoints constructor.
 */
glift.displays.boardPoints = function(points, spacing, maxIntersects) {
  return new BoardPoints(points, spacing, maxIntersects);
};

/**
 * Construct the board points from a linebox (see linebox.js).
 *
 * TODO(kashomon): This is pretty irritating to test.  Is there an easier way to
 * structure this?
 */
glift.displays.boardPointsFromLineBox = function(linebox, maxIntersects) {
  var spacing = linebox.spacing,
      radius = spacing / 2,
      linebbox = linebox.bbox,
      left = linebbox.left() + linebox.extensionBox.left() * spacing,
      top = linebbox.top() + linebox.extensionBox.top() * spacing,
      leftPt = linebox.pointTopLeft.x(),
      topPt = linebox.pointTopLeft.y(),
      // Mapping from int point hash, e.g., (0,18), to coordinate data.
      points = {};

  for (var i = 0; i <= linebox.yPoints; i++) {
    for (var j = 0; j <= linebox.xPoints; j++) {
      var xCoord = left + j * spacing;
      var yCoord = top + i * spacing;
      var intPt = glift.util.point(leftPt + j, topPt + i);

      // TODO(kashomon): Prehaps the coordinate point should be truncated?
      // right now it's ~15 decimal places.  This is too much precision and it
      // might hurt performance.
      var coordPt = glift.util.point(xCoord, yCoord);
      points[intPt.hash()] = {
        // Integer point.
        intPt: intPt,
        coordPt: coordPt,
        bbox: glift.displays.bboxFromPts(
            glift.util.point(coordPt.x() - radius, coordPt.y() - radius),
            glift.util.point(coordPt.x() + radius, coordPt.y() + radius))
      };
    }
  }
  return glift.displays.boardPoints(points, spacing, maxIntersects);
};

/**
 * BoardPoints maintains a mapping from an intersection on the board
 * to a coordinate in pixel-space. It also contains information about the
 * spcaing of the points and the radius (useful for drawing circles).
 *
 * Later, this is directly to create everything that lives on an intersection.
 * In particular,
 *  - lines
 *  - star ponts
 *  - marks
 *  - stones
 *  - stone shadows
 *  - button bounding box.
 *
 *  Note: The integer points are 0 Indexed.
 */
var BoardPoints = function(points, spacing, numIntersections) {
  this.points = points; // int hash is 0 indexed, i.e., 0->18.
  this.spacing = spacing;
  this.radius = spacing / 2;
  this.numIntersections = numIntersections; // 1 indexed (1->19)
};

BoardPoints.prototype = {
  /**
   * Get the points.
   *
   * TODO(kashomon): Remove?  I don't think this is necessary any longer.
   */
  getCoords: function() {
    return this.points;
  },

  /**
   * Get the coordinate for a given integer point string.  Note: the integer
   * points are 0 indexed, i.e., 0->18.
   *
   * Ex. :  (0,2) =>
   *  {
   *    intPt: (0,2),
   *    coordPt: (12.2, 34.2),
   *    ...
   *  }
   */
  getCoord: function(pt) {
    return this.points[pt.hash()];
  },

  /**
   * Traverse over all the points. The order in which the points are traversed
   * is not guaranteed.
   */
  forEach: function(func) {
    for (var key in this.points) {
      func(this.points[key]);
    }
  },

  /**
   * Return the points as an array.  This is useful for D3, in particular.
   */
  data: function() {
    var data = [];
    this.forEach(function(point) {
      data.push(point);
    });
    return data;
  },

  /**
   * Test whether an integer point exists in the points map.
   * TODO(kashomon): Rename.  This is not apt since it confuses the idea of
   * integer points and float coordinates.
   */
  hasCoord: function(pt) {
    return this.points[pt.hash()] !== undefined;
  },

  /**
   * Return an array on integer points (0-indexed), used to indicate where star
   * points should go. Ex. [(3,3), (3,9), (3,15), ...].  This only returns the
   * points that are actually present in the points mapping.
   */
  starPoints: function() {
    var point = glift.util.point,
        // In pts, each element in the sub array is mapped against every other
        // element.  Thus [2, 6] generates [(2,2), (2,6), (6,2), (6,6)] and
        // [[2, 6], [4]] generates the above concatinated with [4,4].
        pts = {
          9 : [[ 2, 6 ], [ 4 ]],
          13 : [[ 3, 9 ], [6]],
          19 : [[ 3, 9, 15 ]]
        },
        outerSet = pts[this.numIntersections] || [],
        outStarPoints = [];
    for (var k = 0; k < outerSet.length; k++) {
      var thisSet = outerSet[k];
      for (var i = 0; i < thisSet.length; i++) {
        for (var j = 0; j < thisSet.length; j++) {
          var pt = point(thisSet[i], thisSet[j]);
          if (this.hasCoord(pt)) {
            outStarPoints.push(pt);
          }
        }
      }
    }
    return outStarPoints;
  },

  /**
   * Draw a circle for every intersection, for debug purposes.
   *
   * TODO(kashomon): This is raphael-specific and should be removed, or changed
   * to use D3.
   */
  _debugDraw: function(paper, color) {
    for (var ptHash in this.points) {
      var centerX = this.points[ptHash].bbox.center().x();
      var centerY = this.points[ptHash].bbox.center().y();
      var circ = paper.circle(centerX, centerY, this.radius);
      circ.attr({fill:color, opacity:.3});
    }
  }
};

})();
