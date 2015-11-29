goog.provide('glift.displays.boardPoints');
goog.provide('glift.displays.BoardPoints');

/**
 * @typedef {{
 *  intPt: glift.Point,
 *  coordPt: glift.Point,
 *  bbox: glift.displays.BoundingBox
 * }}
 */
glift.displays.BoardPt;

/**
 * Construct the board points from a linebox.
 */
glift.displays.boardPoints = function(
    linebox, maxIntersects, drawBoardCoords) {

  var spacing = linebox.spacing,
      radius = spacing / 2,
      linebbox = linebox.bbox,
      leftExtAmt = linebox.leftExt * spacing,
      rightExtAmt = linebox.rightExt * spacing,
      left = linebbox.left() + leftExtAmt,

      topExtAmt = linebox.topExt * spacing,
      botExtAmt = linebox.botExt * spacing,
      top = linebbox.top() + topExtAmt,
      leftPt = linebox.pointTopLeft.x(),
      topPt = linebox.pointTopLeft.y(),
      // Mapping from int point string, e.g., '0,18', to coordinate data.
      points = {},
      xCoordLabels = 'ABCDEFGHJKLMNOPQRSTUVWXYZ',
      edgeCoords = [];

  for (var i = 0; i <= linebox.yPoints; i++) {
    for (var j = 0; j <= linebox.xPoints; j++) {
      var xCoord = left + j * spacing;
      var yCoord = top + i * spacing;
      var intPt = glift.util.point(leftPt + j, topPt + i);
      var coordPt = glift.util.point(xCoord, yCoord);

      if (drawBoardCoords) {
        if ((i === 0 || i === linebox.yPoints) &&
            (j === 0 || j === linebox.xPoints)) {
          // Discard corner points
        } else if (i === 0 || i === linebox.yPoints) {
          // Handle the top and bottom sides.
          if (i === 0) {
            coordPt = coordPt.translate(0, -1 * topExtAmt);
          } else if (i === linebox.yPoints) {
            coordPt = coordPt.translate(0, botExtAmt)
          }
          edgeCoords.push({
            label: xCoordLabels.charAt(intPt.x()  - 1),
            coordPt: coordPt
          });
        } else if (j === 0 || j === linebox.xPoints)  {
          // Handle the left and right sides.
          if (j === 0) {
            coordPt = coordPt.translate(-1 * leftExtAmt, 0);
          } else if (j === linebox.xPoints) {
            coordPt = coordPt.translate(rightExtAmt, 0)
          }
          edgeCoords.push({
            // Flip the actual label around the x-axis.
            label: Math.abs(intPt.y() - maxIntersects) + 1,
            coordPt: coordPt
          });
        } else {
          intPt = intPt.translate(-1, -1);
          points[intPt.hash()] = {
            intPt: intPt,
            coordPt: coordPt,
            bbox: glift.displays.bbox.fromPts(
                glift.util.point(coordPt.x() - radius, coordPt.y() - radius),
                glift.util.point(coordPt.x() + radius, coordPt.y() + radius))
          };
        }
      } else {
        // Default case: Don't draw coordinates
        points[intPt.hash()] = {
          intPt: intPt,
          coordPt: coordPt,
          bbox: glift.displays.bbox.fromPts(
              glift.util.point(coordPt.x() - radius, coordPt.y() - radius),
              glift.util.point(coordPt.x() + radius, coordPt.y() + radius))
        };
      }
    }
  }
  return new glift.displays.BoardPoints(
      points, spacing, maxIntersects, edgeCoords);
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
 *
 * @constructor @final @struct
 */
glift.displays.BoardPoints = function(
    points, spacing, numIntersections, edgeLabels) {
  this.points = points; // int hash is 0 indexed, i.e., 0->18.
  this.spacing = spacing;
  this.radius = spacing / 2;
  this.numIntersections = numIntersections; // 1 indexed (1->19)
  this.edgeCoordLabels = edgeLabels;
  this.dataCache = undefined;
};

glift.displays.BoardPoints.prototype = {
  /**
   * Get the coordinate for a given integer point string.  Note: the integer
   * points are 0 indexed, i.e., 0->18 for a 19x19.  Recall that board points
   * from the the top left (0,0) to the bottom right (18, 18).
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
   * Return the points as an array.
   */
  data: function() {
    if (this.dataCache !== undefined) {
      return this.dataCache;
    }
    var data = [];
    this.forEach(function(point) {
      data.push(point);
    });
    this.dataCache = data;
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
  }
};
