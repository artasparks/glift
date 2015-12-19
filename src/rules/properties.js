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
 * modifications (e.g., rotations). It may also be useful for identifying boards
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
   * Prop: An SGF Property
   * Value: Either of:
   *  A string.
   *  An array of strings.
   *
   * Eventually, each sgf property should be matched to a datatype.  For now,
   * the user is allowed to put arbitrary data into a property.
   *
   * Note that this does not overwrite an existing property - for that, the user
   * has to delete the existing property. If the property already exists, we add
   * another data element onto the array.
   *
   * @param {glift.rules.prop} prop
   * @param {string|!Array<string>} value
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
    var valueType = glift.util.typeOf(value);

    if (valueType !== 'string' && valueType !== 'array') {
      throw new Error('Unsupported type "' + valueType + '" for prop ' + prop);
    } else if (valueType === 'array') {
      // Force all array values to be of type string.
      for (var i = 0, len = value.length; i < len; i++) {
        // Ensure properties are strings
        value[i] = this.unescape(value[i]);
      }
    } else if (valueType === 'string') {
      value = [ this.unescape(/** @type {string} */ (value)) ];
    } else {
      throw new Error('Unexpected type ' +
          glift.util.typeOf(value) + ' for prop ' + prop);
    }

    // Convert any point rectangles. We do not allow point rectangles in our
    // SGF property data, since it makes everything much more complex.
    var pointRectangleRegex = /^[a-z][a-z]:[a-z][a-z]$/;
    var finished = [];
    for (var i = 0; i < value.length; i++) {
      if (pointRectangleRegex.test(value[i])) {
        // This is a rectangle of points. Sigh.
        var pts = glift.util.pointArrFromSgfProp(value[i]);
        for (var j = 0; j < pts.length; j++) {
          finished.push(pts[j].toSgfCoord());
        }
      } else {
        finished.push(value[i]);
      }
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
    var regex = /([a-z][a-z])/g;
    if (prop === glift.rules.prop.LB) {
      // We handle labels specially since labels have a unqiue format
      regex = /([a-z][a-z])(?=:)/g;
    }
    var vals = this.getAllValues(prop);
    for (var i = 0; i < vals.length; i++) {
      vals[i] = vals[i].replace(regex, function(sgfPoint) {
        return glift.util.pointFromSgfCoord(sgfPoint)
            .rotate(size, rotation)
            .toSgfCoord();
      });
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
    if (prop !== undefined && value !== undefined) {
      if (glift.util.typeOf(value) === 'string') {
        this.propMap[prop] = [
            this.unescape(/** @type {string} */ (value)) ];
      } else if (glift.util.typeOf(value) === 'array') {
        for (var i = 0; i < value.length; i++) {
          if (glift.util.typeOf(value[i]) !== 'string') {
            throw new Error('When setting via an array, all values ' +
              'must be strings. was [' + glift.util.typeOf(value[i]) +
              '], for value ' + value[i]);
          }
          value[i] = this.unescape(value[i]);
        }
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
   * @return {!Array<!glift.Point>} points.
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
   * @param {!Object<glift.rules.prop, !Array<string>>} conditions Set of
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
   * Get all display intersections. Equivalent to calling getAllStones and
   * getAllMarks and merging the result. Note that the points are segregated by
   * category:
   *
   * {
   *  BLACK: [...],
   *  WHITE: [...],
   *  LABEL: [...],
   *  SQUARE: [...],
   * }
   *
   * Note that the marks could (and usually will) overlap with the stones, so
   * duplicate points need to be accounted for.
   */
  getAllDisplayPts: function() {
    var marks = this.getAllMarks();
    var stones = this.getAllStones();
    var out = {};
    for (var key in marks) {
      out[key] = marks[key];
    }
    for (var key in stones) {
      out[key] = stones[key];
    }
    return out;
  },

  /**
   * Get the game info key-value pairs. Ex:
   * [{
   *  prop: GN
   *  displayName: 'Game Name',
   *  value: 'Lee Sedol vs Gu Li'
   * },...
   * ]
   * @return {!Array<glift.rules.PropDescriptor>}
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

  /**
   * Escapes some text by converting ] to \\] 
   * @param {string} text
   * @return {string}
   */
  escape: function(text) {
    return text.toString().replace(/]/g, '\\]');
  },

  /**
   * Unescapes some text by converting \\] to ] 
   * @param {string} text
   * @return {string}
   */
  unescape: function(text) {
    return text.toString().replace(/\\]/g, ']');
  }
};
