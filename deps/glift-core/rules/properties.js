goog.provide('glift.rules.Properties');
goog.provide('glift.rules.MoveCollection');

/**
 * @param {!Object<glift.rules.prop, !Array<string>>=} opt_map
 * @return {!glift.rules.Properties}
 */
glift.rules.properties = function(opt_map) {
  return new glift.rules.Properties(opt_map);
};

/**
 * A collection of moves.
 *
 * @typedef {{
 *  WHITE: !Array<!glift.rules.Move>,
 *  BLACK: !Array<!glift.rules.Move>
 * }}
 */
glift.rules.MoveCollection;


/**
 * Mark Value. Encapsulates type of mark properties.
 * @typedef {{
 *  point: !glift.Point,
 *  value: string
 * }}
 */
glift.rules.MarkValue;


/**
 * A collection of marks.
 *
 * @typedef {!Object<glift.enums.marks, !Array<glift.rules.MarkValue>>}
 */
glift.rules.MarkCollection;


/**
 * An object describing a property.
 *
 * Example:
 * {
 *  prop: GN
 *  displayName: 'Game Name',
 *  value: 'Lee Sedol vs Gu Li'
 * }
 *
 * @typedef {{
 *  prop: glift.rules.prop,
 *  displayName: string,
 *  value: string
 * }}
 */
glift.rules.PropDescriptor;

/**
 * Properties that accept point values. This is here mostly for full-board
 * modifications (e.g., rotations). It may also be useful for identifying
 * boards.
 *
 * Notes: There are several ways to represent points in SGFs.
 *  [ab] - Simple point at 0,1 (origin=upper left. oriented down-right)
 *  [aa:cc] - Point Rectangle (all points from 0,0 to 2,2 in a rect)
 *
 * Additionally Labels (LB) have the format
 *  [ab:label]
 *
 * @type {!Object<glift.rules.prop, boolean>}
 */
glift.rules.propertiesWithPts = {
  // Marks
  CR: true, LB: true, MA: true, SQ: true, TR: true,
  // Stones
  B: true, W: true, AW: true, AB: true,
  // Clear Stones
  AE: true,
  // Misc. These properties are very rare, and usually can be ignored.
  // Still, they're here for completeness.
  AR: true, // arrow
  DD: true, // gray area
  LN: true, // line
  TB: true, // black area/territory
  TW: true // white area
};

/**
 * @param {!Object<glift.rules.prop, !Array<string>>=} opt_map
 *
 * @package
 * @constructor @final @struct
 */
glift.rules.Properties = function(opt_map) {
  /** @package {!Object<glift.rules.prop, !Array<string>>} */
  this.propMap = opt_map || {};
};

glift.rules.Properties.prototype = {
  /**
   * Add an SGF Property to the current move.
   *
   * Note that this does not overwrite an existing property - for that, the user
   * has to delete the existing property. If the property already exists, we add
   * another data element onto the array.
   *
   * We also assume that all point-rectangles have been converted by the parser
   * into lists of points. http://www.red-bean.com/sgf/sgf4.html#3.5.1
   *
   * @param {glift.rules.prop} prop An sgf property in it's FF4 form (ex: AB).
   * @param {string|!Array<string>} value Either a string or an array of
   *    strings.
   * @return {!glift.rules.Properties} this
   */
  add: function(prop, value) {
    // Return if the property is not string or a real property
    if (!glift.rules.prop[prop]) {
      glift.util.logz('Warning! The property [' + prop + ']' +
          ' is not valid and is not recognized in the SGF spec.' +
          ' Thus, this property will be ignored');
      return this;
    }

    var finished = [];
    if (typeof value === 'string') {
      var zet = /** @type {string} */ (value);
      finished = [value];
    } else {
      finished = /** @type {!Array<string>} */ (value);
    }

    // If the type is a string, make into an array or concat.
    if (this.contains(prop)) {
      this.propMap[prop] = this.getAllValues(prop).concat(finished);
    } else {
      this.propMap[prop] = finished;
    }
    return this;
  },

  /**
   * Return an array of data associated with a property key.  Note: this returns
   * a shallow copy of the properties.
   *
   * If the property doesn't exist, returns null.
   */
  getAllValues: function(strProp) {
    if (glift.rules.prop[strProp] === undefined) {
      return null; // Not a valid Property
    } else if (this.propMap[strProp]) {
      return this.propMap[strProp].slice(); // Return a shallow copy.
    } else {
      return null;
    }
  },

  /**
   * Gets one piece of data associated with a property. Default to the first
   * element in the data associated with a property.
   *
   * Since the getOneValue() always returns an array, it's sometimes useful to
   * return the first property in the list.  Like getOneValue(), if a property
   * or value can't be found, null is returned.
   *
   * @param {glift.rules.prop} prop The property
   * @param {number=} opt_index Optional index. Defaults to 0.
   * @return {?string} The string property or null.
   */
  getOneValue: function(prop, opt_index) {
    var index = opt_index || 0;
    var arr = this.getAllValues(prop);
    if (arr && arr.length >= 1) {
      return arr[index];
    } else {
      return null;
    }
  },

  /**
   * Get a value from a property and return the point representation.
   * Optionally, the user can provide an index, since each property points to an
   * array of values.
   *
   * @param {glift.rules.prop} prop The SGF property.
   * @param {number=} opt_index Optional index. defaults to 0.
   * @return {?glift.Point} Returns a Glift point or null if the property
   *    doesn't exist.
   */
  getAsPoint: function(prop, opt_index) {
    var out = this.getOneValue(prop, opt_index);
    if (out) {
      return glift.util.pointFromSgfCoord(out);
    } else {
      return null;
    }
  },

  /**
   * Rotates an SGF Property. Note: This only applies to stone-properties.
   *
   * Recall that in the SGF, we should have already converted any point
   * rectangles, so there shouldn't be any issues here with converting point
   * rectangles.
   *
   * @param {glift.rules.prop} prop
   * @param {number} size Size of the Go Board.
   * @param {glift.enums.rotations} rotation Rotation to perform
   */
  rotate: function(prop, size, rotation) {
    if (!glift.rules.propertiesWithPts[prop]) {
      return;
    }
    if (!glift.enums.rotations[rotation] ||
        rotation === glift.enums.rotations.NO_ROTATION) {
      return
    }
    // Replace all the values for this property.
    this.pointsReplace_(prop, size, function(sgfPoint) {
      return glift.util.pointFromSgfCoord(sgfPoint)
          .rotate(size, rotation)
          .toSgfCoord();
    });
  },

  /**
   * Flips the SGF point-values over thy Y axis (Flipping the X-points);
   * @param {glift.rules.prop} prop
   * @param {number} size
   */
  flipHorz: function(prop, size) {
    if (!glift.rules.propertiesWithPts[prop]) {
      return;
    }
    this.pointsReplace_(prop, size, function(sgfPoint) {
      return glift.util.pointFromSgfCoord(sgfPoint)
          .flipHorz(size)
          .toSgfCoord();
    });
  },

  /**
   * Flips the SGF point-values over thy X axis (Flipping the Y-points);
   * @param {glift.rules.prop} prop
   * @param {number} size
   */
  flipVert: function(prop, size) {
    if (!glift.rules.propertiesWithPts[prop]) {
      return;
    }
    this.pointsReplace_(prop, size, function(sgfPoint) {
      return glift.util.pointFromSgfCoord(sgfPoint)
          .flipVert(size)
          .toSgfCoord();
    });
  },

  /**
   * Helper for replacing SGF points.
   * @param {glift.rules.prop} prop
   * @param {number} size
   * @param {function(string): string} replFn
   * @private
   */
  pointsReplace_: function(prop, size, replFn) {
    if (!glift.rules.propertiesWithPts[prop]) {
      return;
    }
    if (!replFn) {
      throw new Error('Replace function must be supplied');
    }
    var regex = /([a-z][a-z])/g;
    if (prop === glift.rules.prop.LB) {
      // We handle labels specially since labels have a unqiue format
      regex = /([a-z][a-z])(?=:)/g;
    }
    var vals = this.getAllValues(prop);
    for (var i = 0; i < vals.length; i++) {
      vals[i] = vals[i].replace(regex, replFn);
    }
    this.propMap[prop] = vals;
  },

  /**
   * Returns true if the current move has the property "prop".  Return
   * false otherwise.
   *
   * @param {glift.rules.prop} prop
   * @return {boolean}
   */
  contains: function(prop) {
    return prop in this.propMap;
  },

  /**
   * Loop over each property / value list.
   * @param {!function(glift.rules.prop, !Array<string>)} func
   */
  forEach: function(func) {
    for (var p in this.propMap) {
      func(p, this.propMap[p]);
    }
  },

  /**
   * Tests wether a prop contains a value
   *
   * @param {glift.rules.prop} prop
   * @param {string} value
   * @return {boolean}
   */
  hasValue : function(prop, value) {
    if (!this.contains(prop)) {
      return false;
    }
    var vals = this.getAllValues(prop);
    for (var i = 0; i < vals.length; i++) {
      if (vals[i] === value) {
        return true;
      }
    }
    return false;
  },

  /**
   * Deletes the prop and return the value.
   * @param {glift.rules.prop} prop
   * @return {?Array<string>} The former values of this property.
   */
  remove: function(prop) {
    if (this.contains(prop)) {
      var allValues = this.getAllValues(prop);
      delete this.propMap[prop];
      return allValues;
    } else {
      return null;
    }
  },

  /**
   * Remove one value from the property list. Returns the value if it was
   * successfully removed.  Removes only the first value -- any subsequent value
   * remains in the property list.
   * @param {glift.rules.prop} prop
   * @param {string} value
   */
  removeOneValue: function(prop, value) {
    if (this.contains(prop)) {
      var allValues = this.getAllValues(prop);
      var index = -1;
      for (var i = 0, len = allValues.length; i < len; i++) {
        if (allValues[i] === value) {
          index = i;
          break;
        }
      }
      if (index !== -1) {
        allValues.splice(index, 1);
        this.set(prop, allValues);
      }
    } else {
      return null;
    }
  },

  /**
   * Sets current value, even if the property already exists.
   * @param {glift.rules.prop} prop
   * @param {string|!Array<string>} value
   * @return {glift.rules.Properties} this
   */
  set: function(prop, value) {
    if (prop && value && glift.rules.prop[prop]) {
      if (glift.util.typeOf(value) === 'string') {
        this.propMap[prop] = [/** @type {string} */ (value)];
      } else if (glift.util.typeOf(value) === 'array') {
        this.propMap[prop] = /** @type {!Array<string>} */ (value);
      }
    }
    return this;
  },

  //---------------------//
  // Convenience methods //
  //---------------------//

  /**
   * Get all the placements for a color.  Return as an array.
   * @param {glift.enums.states} color
   * @return {!Array<!glift.Point>} points. If no placements are found, returns
   *    an empty array.
   */
  getPlacementsAsPoints: function(color) {
    var prop;
    if (color === glift.enums.states.BLACK) {
      prop = glift.rules.prop.AB;
    } else if (color === glift.enums.states.WHITE) {
      prop = glift.rules.prop.AW;
    } else {
      return  [];
    }

    if (!this.contains(prop)) {
      return [];
    }
    return glift.sgf.allSgfCoordsToPoints(this.getAllValues(prop));
  },

  /**
   * Get all the clear-locations as points. Clear locations are indicated by AE.
   * The SGF spec is unclear about how to handle clear-locations when there are
   * other stone properties (B,W,AB,AW). Generally, it probably makes the most
   * sense to apply the clear-locations first.
   *
   * @return {!Array<!glift.Point>} the points. If the AE property isn't found,
   *    returns an empty array.
   */
  getClearLocationsAsPoints: function() {
    var AE = glift.rules.prop.AE;
    if (!this.contains(AE)) {
      return [];
    }
    return glift.sgf.allSgfCoordsToPoints(this.getAllValues(AE));
  },

  /**
   * Get the current comment on the move. It's provided as a convenience method
   * since it's an extremely comment operation.
   *
   * @return {?string}
   */
  getComment: function() {
    if (this.contains(glift.rules.prop.C)) {
      return this.getOneValue(glift.rules.prop.C);
    } else {
      return null;
    }
  },

  /**
   * Get the current Move.  Returns null if no move exists.
   *
   * If the move is a pass, then in the SGF, we'll see B[] or W[].  Thus,
   * we will return { color: BLACK } or { color: WHITE }, but we won't have any
   * point associated with this.
   *
   * @return {?glift.rules.Move}.
   */
  getMove: function() {
    var BLACK = glift.enums.states.BLACK;
    var WHITE = glift.enums.states.WHITE;
    if (this.contains(glift.rules.prop.B)) {
      if (this.getOneValue(glift.rules.prop.B) === "") {
        return { color: BLACK }; // This is a PASS
      } else {
        return {
          color: BLACK,
          point: this.getAsPoint(glift.rules.prop.B) || undefined
        }
      }
    } else if (this.contains(glift.rules.prop.W)) {
      if (this.getOneValue(glift.rules.prop.W) === '') {
        return { color: WHITE }; // This is a PASS
      } else {
        return {
          color: WHITE,
          point: this.getAsPoint(glift.rules.prop.W) || undefined
        };
      }
    } else {
      return null;
    }
  },

  /**
   * Test whether this set of properties match a series of conditions.  Returns
   * true or false.  Conditions have the form:
   *
   * { <property>: [series,of,conditions,to,match], ... }
   *
   * Example:
   *    Matches if there is a GB property or the words 'Correct' or 'is correct' in
   *    the commentj
   *    { GB: [], C: ['Correct', 'is correct'] }
   *
   * Note: This is an O(lnm) ~ O(n^3).  But practice, you'll want to test
   * against singular properties, so it's more like O(n^2)
   *
   * @param {!glift.rules.ProblemConditions} conditions Set of
   *    property-conditions to check.
   * @return {boolean}
   */
  matches: function(conditions) {
    for (var key in conditions) {
      if (this.contains(key)) {
        var substrings = conditions[key];
        if (substrings.length === 0) {
          return true;
        }
        var allValues = this.getAllValues(key);
        for (var i = 0, len = allValues.length ; i < len; i++) {
          for (var j = 0, slen = substrings.length; j < slen; j++) {
            var value = allValues[i];
            var substr = substrings[j];
            if (value.indexOf(substr) !== -1) {
              return true;
            }
          }
        }
      }
    }
    return false;
  },

  /**
   * Get all the stones (placements and moves).  This ignores 'PASS' moves.
   *
   * @return {!glift.rules.MoveCollection}
   */
  getAllStones: function() {
    var states = glift.enums.states,
        out = {},
        BLACK = states.BLACK,
        WHITE = states.WHITE;
    out.WHITE = [];
    out.BLACK = [];

    var bplace = this.getPlacementsAsPoints(states.BLACK);
    var wplace = this.getPlacementsAsPoints(states.WHITE);
    for (var i = 0; i < bplace.length; i++) {
      out.BLACK.push({point: bplace[i], color: BLACK});
    }
    for (var i = 0; i < wplace.length; i++) {
      out.WHITE.push({point: wplace[i], color: WHITE});
    }
    var move = this.getMove();
    if (move && move.point) {
      out[move.color].push(move);
    }
    return out;
  },


  /**
   * Gets all the marks, where the output is a map from glift mark enum to array
   * of points. In the case of labels, a value key is supplied as well to
   * indicate the label. Note that the board must contain at least one mark for
   * a key to exist in the output map
   *
   * The return has the format:
   *  {
   *    LABEL: [{value: lb, point: pt}, ...],
   *    : [{point: pt}, ...]
   *  }
   * return {!glift.rules.MarkCollection}
   */
  getAllMarks: function() {
    /**
     * @type {!Object<glift.rules.prop, glift.enums.states>}
     */
    var propertiesToMarks = {
      CR: glift.enums.marks.CIRCLE,
      LB: glift.enums.marks.LABEL,
      MA: glift.enums.marks.XMARK,
      SQ: glift.enums.marks.SQUARE,
      TR: glift.enums.marks.TRIANGLE
    };
    var outMarks = {};
    for (var prop in propertiesToMarks) {
      var mark = propertiesToMarks[prop];
      if (this.contains(prop)) {
        var data = this.getAllValues(prop);
        var marksToAdd = [];
        for (var i = 0; i < data.length; i++) {
          if (prop === glift.rules.prop.LB) {
            // Labels have the form { point: pt, value: 'A' }
            marksToAdd.push(glift.sgf.convertFromLabelData(data[i]));
          } else {
            // A single point or a point rectangle (which is why the return-type
            // is an array.
            var newPts = glift.util.pointArrFromSgfProp(data[i])
            for (var j = 0; j < newPts.length; j++) {
              marksToAdd.push({
                point: newPts[j]
              });
            }
          }
        }
        outMarks[mark] = marksToAdd;
      }
    }
    return outMarks;
  },

  /**
   * Get the game info key-value pairs. Ex:
   * [{
   *  prop: GN
   *  displayName: 'Game Name',
   *  value: 'Lee Sedol vs Gu Li'
   * },...
   * ]
   * @return {!Array<!glift.rules.PropDescriptor>}
   */
  // TODO(kashomon): Add test
  getGameInfo: function() {
    var gameInfoArr = [];
    /**
     * @type {!Object<glift.rules.prop, string>}
     */
    var propNameMap = {
      PW: 'White Player',
      PB: 'Black Player',
      RE: 'Result',
      AN: 'Commenter',
      SO: 'Source',
      RU: 'Ruleset',
      KM: 'Komi',
      GN: 'Game Name',
      EV: 'Event',
      RO: 'Round',
      PC: 'Place Name',
      DT: 'Date'
    };
    for (var key in propNameMap) {
      if (this.contains(key)) {
        var displayName = propNameMap[key];
        var obj = {
          prop: key,
          displayName: displayName,
          value: this.getOneValue(key)
        };
        // Post processing for some values.
        // We attach the ranks like Kashomon [9d], if they exist.
        if (key === glift.rules.prop.PW &&
            this.contains(glift.rules.prop.WR)) {
          obj.value += ' [' + this.getOneValue(glift.rules.prop.WR) + ']';
        } else if (key === glift.rules.prop.PB &&
            this.contains(glift.rules.prop.BR)) {
          obj.value += ' [' + this.getOneValue(glift.rules.prop.BR) + ']';
        }
        // Remove trailing zeroes on komi amounts.
        else if (key === glift.rules.prop.KM) {
          obj.value = parseFloat(this.getOneValue(key)) + '' || '0';
        }
        gameInfoArr.push(obj);
      }
    }
    return gameInfoArr;
  },
};
