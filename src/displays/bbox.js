glift.displays.bboxFromPts = function(topLeftPt, botRightPt) {
  return new glift.displays._BoundingBox(topLeftPt, botRightPt);
};

glift.displays.bboxFromDiv = function(divId) {
  var elem = glift.dom.elem(divId);
  return glift.displays.bbox(
      glift.util.point(0,0),
      elem.width(),
      elem.height());
};

glift.displays.bbox = function(topLeft, width, height) {
  return new glift.displays._BoundingBox(
      topLeft, glift.util.point(topLeft.x() + width, topLeft.y() + height));
};

/**
 * A bounding box, represented by a top left point and bottom right point.
 * This is how we represent space in glift, from GoBoards to sections allocated
 * for widgets.
 */
glift.displays._BoundingBox = function(topLeftPtIn, botRightPtIn) {
  this._topLeftPt = topLeftPtIn;
  this._botRightPt = botRightPtIn;
};

glift.displays._BoundingBox.prototype = {
  topLeft: function() { return this._topLeftPt; },
  botRight: function() { return this._botRightPt; },
  width: function() { return this.botRight().x() - this.topLeft().x(); },
  height: function() { return this.botRight().y() - this.topLeft().y(); },
  top: function() { return this.topLeft().y(); },
  left: function() { return this.topLeft().x(); },
  bottom: function() { return this.botRight().y(); },
  right: function() { return this.botRight().x(); },

  /**
   * Find the center of the box. Returns a point representing the center.
   */
  center: function() {
    return glift.util.point(
      Math.abs((this.botRight().x() - this.topLeft().x()) / 2)
          + this.topLeft().x(),
      Math.abs((this.botRight().y() - this.topLeft().y()) / 2)
          + this.topLeft().y());
  },

  /**
   * Test to see if a point is contained in the bounding box.  Points on the
   * edge count as being contained.
   */
  contains: function(point) {
   return point.x() >= this.topLeft().x()
      && point.x() <= this.botRight().x()
      && point.y() >= this.topLeft().y()
      && point.y() <= this.botRight().y();
  },

  /**
   * Test to see if two bboxes are equal by comparing whether their points.
   */
  equals: function(other) {
    return other.topLeft() && this.topLeft().equals(other.topLeft()) &&
        other.botRight() && this.botRight().equals(other.botRight());
  },

  /**
   * Return a new bbox with the width and the height scaled by some fraction.
   * The TopLeft point is also scaled by the amount.
   */
  scale: function(amount) {
    var newHeight = this.height() * amount,
        newWidth = this.width() * amount,
        newTopLeft = glift.util.point(
            this.topLeft().x() * amount, this.topLeft().y() * amount);
    return glift.displays.bbox(newTopLeft, newWidth, newHeight);
  },

  toString: function() {
    return this.topLeft().toString() + ',' +  this.botRight().toString();
  },

  translate: function(dx, dy) {
    return glift.displays.bboxFromPts(
        glift.util.point(this.topLeft().x() + dx, this.topLeft().y() + dy),
        glift.util.point(this.botRight().x() + dx, this.botRight().y() + dy));
  },

  /**
   * Split this bbox into two or more divs across a horizontal axis.  The
   * variable bboxSplits is an array of decimals -- the box will be split via
   * these decimals.
   *
   * In other words, splits a box like so:
   *
   * X ->  X
   *       X
   *
   * Note: There is always one less split decimal specified, so that we don't
   * have rounding errors.In other words: [0.7] uses 0.7 and 0.3 for splits and
   * [0.7, 0.2] uses 0.7, 0.2, and 0.1 for splits.
   */
  hSplit: function(bboxSplits) {
    return this._splitBox('h', bboxSplits);
  },

  /**
   * Split this bbox into two or more divs across a horizontal axis.  The
   * variable bboxSplits is an array of decimals -- the box will be split via
   * these decimals.  They must sum to 1, or an exception is thrown.
   *
   * In other words, splits a box like so:
   * X ->  X X
   *
   * Note: There is always one less split decimal specified, so that we don't
   * have rounding errors.In other words: [0.7] uses 0.7 and 0.3 for splits and
   * [0.7, 0.2] uses 0.7, 0.2, and 0.1 for splits.
   */
  vSplit: function(bboxSplits) {
    return this._splitBox('v', bboxSplits);
  },

  /**
   * Internal method for vSplit and hSplit.
   */
  _splitBox: function(d, bboxSplits) {
    if (glift.util.typeOf(bboxSplits) !== 'array') {
      throw "bboxSplits must be specified as an array. Was: "
          + glift.util.typeOf(bboxSplits);
    }
    if (!(d === 'h' || d === 'v')) {
      throw "What!? The only splits allowed are 'v' or 'h'.  " +
          "You supplied: " + d;
    }
    var totalSplitAmount = 0;
    for (var i = 0; i < bboxSplits.length; i++) {
      totalSplitAmount += bboxSplits[i];
    }
    if (totalSplitAmount >= 1) {
      throw "The box splits must sum to less than 1, but instead summed to: " +
          totalSplitAmount;
    }

    // Note: this is really just used as marker.  We use the final
    // this.botRight().x() / y() for the final marker to prevent rounding
    // errors.
    bboxSplits.push(1 - totalSplitAmount);

    var currentSplitPercentage = 0;
    var outBboxes = [];
    var currentTopLeft = this.topLeft().clone();
    for (var i = 0; i < bboxSplits.length; i++) {
      if (i === bboxSplits.length - 1) {
        currentSplitPercentage = 1;
      } else {
        currentSplitPercentage += bboxSplits[i];
      }

      // TODO(kashomon): All this switching makes me think there should be a
      // separate method for a single split.
      var nextBotRightX = d === 'h' ?
          this.botRight().x() :
          this.topLeft().x() + this.width() * currentSplitPercentage;
      var nextBotRightY = d === 'h' ?
          this.topLeft().y() + this.height() * currentSplitPercentage :
          this.botRight().y();
      var nextBotRight = glift.util.point(nextBotRightX, nextBotRightY);
      outBboxes.push(glift.displays.bboxFromPts(currentTopLeft, nextBotRight));
      var nextTopLeftX = d === 'h' ?
          currentTopLeft.x() :
          this.topLeft().x() + this.width() * currentSplitPercentage;
      var nextTopLeftY = d === 'h' ?
          this.topLeft().y() + this.height() * currentSplitPercentage :
          currentTopLeft.y();
      currentTopLeft = glift.util.point(nextTopLeftX, nextTopLeftY);
    }
    return outBboxes;
  }
};
