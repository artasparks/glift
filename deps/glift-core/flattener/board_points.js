goog.provide('glift.flattener.BoardPoints');
goog.provide('glift.flattener.EdgeLabel');
goog.provide('glift.flattener.BoardPt');

/**
 * A collection of values indicating in intersection  on the board. The intPt is
 * the standard (0-18,0-18) point indexed from the upper left. The coordPt is
 * the float point in pixel space. Lastly, each intersection on the board 'owns'
 * an area of space, indicated by the bounding box.
 *
 * @typedef {{
 *  intPt: !glift.Point,
 *  coordPt: !glift.Point,
 * }}
 */
glift.flattener.BoardPt;

/**
 * A label on the edge of the board, for when the draw board coordinates option
 * is set.
 *
 * @typedef {{
 *  label: string,
 *  coordPt: !glift.Point
 * }}
 */
glift.flattener.EdgeLabel;


/**
 * Options for creating a BoardPoints instance.
 *
 * @typedef {{
 *  drawBoardCoords: (boolean|undefined),
 *  padding: (number|undefined),
 *  croppedEdgePadding: (number|undefined),
 *  offsetPt: (!glift.Point|undefined),
 * }}
 *
 * drawBoardCoords: whether to draw the board coordinates:
 * padding: Amount of extra spacing around the edge of the board. As a fraction
 *    of an intersection. Defaults to zero.
 *    Example: If padding = 0.75 and spacing = 20, then the actual
 *    padding around each edge will be 15.
 * croppedEdgePadding: Same as padding, but only for cropped-edges and in
 *    addition to normal padding.
 * offsetPt: It's possible that we may want to offset the board points (as in
 *    glift, for centering within a boardbox).
 */
glift.flattener.BoardPointsOptions;

/**
 * BoardPoints is a helper for actually rendering the board when pixel
 * representations are required.
 *
 * In more detail: board points maintains a mapping from an intersection on the
 * board to a coordinate in pixel-space. It also contains information about the
 * spacing of the points and the radius (useful for drawing circles).
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
 * @param {!Array<!glift.flattener.BoardPt>} points
 * @param {number} spacing
 * @param {!glift.orientation.BoundingBox} intBbox
 * @param {number} numIntersections
 * @param {!Array<!glift.flattener.EdgeLabel>} edgeLabels
 *
 * @constructor @final @struct
 */
glift.flattener.BoardPoints = function(
    points, spacing, intBbox, coordBbox, numIntersections, edgeLabels) {
  /** @const {!Array<!glift.flattener.BoardPt>} */
  this.points = points;

  /** @const {!Object<!glift.PtStr, !glift.flattener.BoardPt>} */
  this.cache = {};
  for (var i = 0; i < this.points.length; i++) {
    var pt = points[i];
    this.cache[pt.intPt.toString()] = pt;
  }

  /** @const {number} */
  this.spacing = spacing;
  /** @const {number} */
  this.radius = spacing / 2;

  /**
   * Bounding box for the intersections.
   * @const {!glift.orientation.BoundingBox}
   */
  this.intBbox = intBbox;

  /**
   * Coordinate bounding box.
   * @const {!glift.orientation.BoundingBox}
   */
  this.coordBbox = coordBbox;

  /** @const {number} */
  this.numIntersections = numIntersections;

  /** @const {!Array<!glift.flattener.EdgeLabel>} */
  this.edgeLabels = edgeLabels;
};

glift.flattener.BoardPoints.prototype = {
  /** @return {number} intersection-width */
  intWidth: function() { return this.intBbox.width() + 1; },
  /** @return {number} intersection-width */
  intHeight: function() { return this.intBbox.height() + 1; },

  /**
   * Get the coordinate for a given integer point string.  Note: the integer
   * points are 0 indexed, i.e., 0->18 for a 19x19.  Recall that board points
   * from the the top left (0,0) to the bottom right (18, 18).
   *
   * @param {!glift.Point} pt
   * @return {!glift.flattener.BoardPt}
   */
  getCoord: function(pt) {
    return this.cache[pt.toString()];
  },

  /**
   * Return all the points as an array.
   * @return {!Array<!glift.flattener.BoardPt>}
   */
  data: function() {
    return this.points;
  },

  /**
   * Test whether an integer point exists in the points map.
   * @param {!glift.Point} pt
   * @return {boolean}
   */
  hasCoord: function(pt) {
    return this.cache[pt.toString()] !== undefined;
  },

  /**
   * Return an array on integer points (0-indexed), used to indicate where star
   * points should go. Ex. [(3,3), (3,9), (3,15), ...].  This only returns the
   * points that are actually present in the points mapping.
   *
   * @return {!Array<!glift.Point>}
   */
  starPoints: function() {
    var sp = glift.flattener.starpoints.allPts(this.numIntersections);
    var out = [];
    for (var i = 0; i < sp.length; i++) {
      var p = sp[i];
      if (this.hasCoord(p)) {
        out.push(p);
      }
    }
    return out;
  }
};

/**
 * Creates a beard points wrapper from a flattened object.
 *
 * @param {!glift.flattener.Flattened} flat
 * @param {number} spacing In pt.
 * @param {glift.flattener.BoardPointsOptions=} opt_options
 */
glift.flattener.BoardPoints.fromFlattened =
    function(flat, spacing, opt_options) {
  var opts = opt_options || {};
  var bbox = flat.board().boundingBox();
  return glift.flattener.BoardPoints.fromBbox(
      bbox,
      spacing,
      flat.board().maxBoardSize(),
      opts);
};

/**
 * Creates a board points wrapper.
 *
 * @param {glift.orientation.BoundingBox} bbox In intersections. For a typical board,
 *    TL is 0,0 and BR is 18,18.
 * @param {number} spacing Of the intersections. In pt.
 * @param {number} size
 * @param {!glift.flattener.BoardPointsOptions} opts
 * @return {!glift.flattener.BoardPoints}
 */
glift.flattener.BoardPoints.fromBbox =
    function(bbox, spacing, size, opts) {
  var tl = bbox.topLeft();
  var br = bbox.botRight();

  var half = spacing / 2;
  /** @type {!Array<!glift.flattener.BoardPt>} */
  var bpts = [];
  /** @type {!Array<!glift.flattener.EdgeLabel>} */
  var edgeLabels = [];

  var drawBoardCoords = !!opts.drawBoardCoords;
  var paddingFrac = opts.padding || 0;
  var paddingAmt = paddingFrac * spacing;

  // Note: Convention is to leave off the 'I' coordinate. Note that capital
  // letters are enough for normal boards.
  var xCoordLabels = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz';

  var offsetPt = opts.offsetPt || new glift.Point(0,0);

  var raggedEdgePaddingFrac = opts.croppedEdgePadding || 0;
  var raggedAmt = raggedEdgePaddingFrac * spacing;
  var raggedLeft = tl.x() === 0 ? 0 : raggedAmt;
  var raggedRight = br.x() === size-1 ? 0 : raggedAmt;
  var raggedTop = tl.y() === 0 ? 0 : raggedAmt;
  var raggedBottom = br.y() === size-1 ? 0 : raggedAmt;

  var offset = drawBoardCoords ? 1 : 0;
  var startX = tl.x();
  var endX = br.x() + 2*offset;
  var startY = tl.y();
  var endY = br.y() + 2*offset;

  var coordBbox = new glift.orientation.BoundingBox(
    new glift.Point(0,0),
    new glift.Point(
        (endX-startX+1)*spacing + 2*paddingAmt + raggedLeft + raggedRight,
        (endY-startY+1)*spacing + 2*paddingAmt + raggedTop + raggedBottom));

  var isEdgeX = function(val) { return val === startX || val === endX; }
  var isEdgeY = function(val) { return val === startY || val === endY; }

  for (var x = startX; x <= endX; x++) {
    for (var y = startY; y <= endY; y++) {
      var i = x - startX;
      var j = y - startY;
      var coordPt = new glift.Point(
          half + i*spacing + paddingAmt + offsetPt.x() + raggedLeft,
          half + j*spacing + paddingAmt + offsetPt.y() + raggedTop)

      if (drawBoardCoords && (isEdgeX(x) || isEdgeY(y))) {
        if (isEdgeX(x) && isEdgeY(y)) {
          // This is a corner; no coords here.
          continue;
        }

        if (raggedLeft && i === 0) {
          coordPt = coordPt.translate(-raggedLeft, 0);
        }
        if (raggedRight && x === endX) {
          coordPt = coordPt.translate(raggedRight, 0);
        }
        if (raggedTop && j === 0) {
          coordPt = coordPt.translate(0, -raggedTop);
        }
        if (raggedBottom && y === endY) {
          coordPt = coordPt.translate(0, raggedBottom);
        }

        var label = '';
        if (isEdgeY(y)) {
          label = xCoordLabels[x-1];
        } else if (isEdgeX(x)) {
          label = (size-y+1) + '';
        } else {
          throw new Error('Yikes! Should not happen! pt:' + x + ',' + y);
        }
        edgeLabels.push({
          label: label,
          coordPt: coordPt,
        });
      } else {

        bpts.push({
          intPt: new glift.Point(x - offset, y - offset),
          coordPt: coordPt,
        });
      }
    }
  }
  return new glift.flattener.BoardPoints(
      bpts,
      spacing,
      bbox,
      coordBbox,
      size,
      edgeLabels);
};
