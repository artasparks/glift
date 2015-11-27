(function() {
glift.rules.properties = function(map) {
  return new Properties(map);
};

/**
 * Properties that accept point values. This is here mostly for full-board
 * modifications (e.g., rotations). It may also be useful for identifying boards
 *
 * Notes: There are several ways to represent points in SGFs.
 *  [ab] - Simple point at 0,1 (origin=upper left. oriented down-right)
 *  [aa:cc] - Point Rectangle (all points from 0,0 to 2,2 in a rect)
 *
 * Additionally Labels (LB) have the format
 *  [lbl
 *
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

/** All the SGF Properties plus some things. */
//  TODO(kashomon): Comment these and delete the invalid ones.
glift.rules.allProperties = {
AB: 'AB', AE: 'AE', AN: 'AN', AP: 'AP', AR: 'AR', AS: 'AS', AW: 'AW', B: 'B',
BL: 'BL', BM: 'BM', BR: 'BR', BS: 'BS', BT: 'BT', C: 'C', CA: 'CA', CH: 'CH',
CP: 'CP', CR: 'CR', DD: 'DD', DM: 'DM', DO: 'DO', DT: 'DT', EL: 'EL', EV: 'EV',
EX: 'EX', FF: 'FF', FG: 'FG', GB: 'GB', GC: 'GC', GM: 'GM', GN: 'GN', GW: 'GW',
HA: 'HA', HO: 'HO', ID: 'ID', IP: 'IP', IT: 'IT', IY: 'IY', KM: 'KM', KO: 'KO',
L: 'L', LB: 'LB', LN: 'LN', LT: 'LT', M: 'M', MA: 'MA', MN: 'MN', N: 'N', OB:
'OB', OH: 'OH', OM: 'OM', ON: 'ON', OP: 'OP', OT: 'OT', OV: 'OV', OW: 'OW', PB:
'PB', PC: 'PC', PL: 'PL', PM: 'PM', PW: 'PW', RE: 'RE', RG: 'RG', RO: 'RO', RU:
'RU', SC: 'SC', SE: 'SE', SI: 'SI', SL: 'SL', SO: 'SO', SQ: 'SQ', ST: 'ST', SU:
'SU', SZ: 'SZ', TB: 'TB', TC: 'TC', TE: 'TE', TM: 'TM', TR: 'TR', TW: 'TW', UC:
'UC', US: 'US', V: 'V', VW: 'VW', W: 'W', WL: 'WL', WR: 'WR', WS: 'WS', WT: 'WT',
MU: 'MU'
};

var Properties = function(map) {
  this.propMap = map || {};
};

Properties.prototype = {
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
   */
  add: function(prop, value) {
    // Return if the property is not string or a real property
    if (!glift.rules.allProperties[prop]) {
      glift.util.logz('Warning! The property [' + prop + ']' +
          ' is not valid and is not recognized in the SGF spec.');
    }
    var valueType = glift.util.typeOf(value);

    if (valueType !== 'string' && valueType !== 'array') {
      // The value has to be either a string or an array.  Maybe we should throw
      // an error?
      value = [ this.unescape(value) ];
    } else if (valueType === 'array') {
      // Force all array values to be of type string.
      for (var i = 0, len = value.length; i < len; i++) {
        // Ensure properties are strings
        value[i] = this.unescape(value[i]);
      }
    } else if (valueType === 'string') {
      value = [ this.unescape(value) ];
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
    if (glift.rules.allProperties[strProp] === undefined) {
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
   */
  getOneValue: function(strProp, index) {
    var index = (index !== undefined
        && typeof index === 'number' && index >= 0) ? index : 0;
    var arr = this.getAllValues(strProp);
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
   * Returns null if the property doesn't exist.
   */
  getAsPoint: function(strProp, index) {
    var out = this.getOneValue(strProp, index);
    if (out) {
      return glift.util.pointFromSgfCoord(out);
    } else {
      return out;
    }
  },

  /**
   * Rotates an SGF Property. Note: This only applies to stone-properties.
   *
   * Recall that in the SGF, we should have already converted any point
   * rectangles, so there shouldn't be any issues here with converting point
   * rectangles.
   */
  rotate: function(strProp, size, rotation) {
    if (!glift.rules.propertiesWithPts.hasOwnProperty(strProp)) {
      return null;
    }
    if (!glift.enums.rotations[rotation] ||
        rotation === glift.enums.rotations.NO_ROTATION) {
      return null;
    }
    var regex = /([a-z][a-z])/g;
    if (strProp === glift.rules.allProperties.LB) {
      // We handle labels specially since labels have a unqiue format
      regex = /([a-z][a-z])(?=:)/g;
    }
    var vals = this.getAllValues(strProp);
    for (var i = 0; i < vals.length; i++) {
      vals[i] = vals[i].replace(regex, function(sgfPoint) {
        return glift.util.pointFromSgfCoord(sgfPoint)
            .rotate(size, rotation)
            .toSgfCoord();
      });
    }
    this.propMap[strProp] = vals;
  },

  /**
   * Returns true if the current move has the property "prop".  Return
   * false otherwise.
   */
  contains: function(prop) {
    return prop in this.propMap;
  },

  /** Tests wether a prop contains a value */
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

  /** Deletes the prop and return the value. */
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
   */
  set: function(prop, value) {
    if (prop !== undefined && value !== undefined) {
      if (glift.util.typeOf(value) === 'string') {
        this.propMap[prop] = [ this.unescape(value) ];
      } else if (glift.util.typeOf(value) === 'array') {
        for (var i = 0; i < value.length; i++) {
          if (glift.util.typeOf(value[i]) !== 'string') {
            throw new Error('When setting via an array, all values ' +
              'must be strings. was [' + glift.util.typeOf(value[i]) +
              '], for value ' + value[i]);
          }
          value[i] = this.unescape(value[i]);
        }
        this.propMap[prop] = value
      }
    }
    return this;
  },

  //---------------------//
  // Convenience methods //
  //---------------------//

  // Get all the placements for a color (BLACK or WHITE).  Return as an array.
  getPlacementsAsPoints: function(color) {
    var prop = '';
    if (color === glift.enums.states.BLACK) {
      prop = glift.rules.allProperties.AB;
    } else if (color === glift.enums.states.WHITE) {
      prop = glift.rules.allProperties.AW;
    }
    if (prop === '' || !this.contains(prop)) {
      return [];
    }
    return glift.sgf.allSgfCoordsToPoints(this.getAllValues(prop));
  },

  /**
   * Get the current comment on the move. This is, of course, just a convenience
   * method -- equivalent to properties().getOneValue('C'). It's provided as a
   * convenience method since it's an extremely comment operation.
   *
   * Returns: string or null.
   */
  getComment: function() {
    if (this.contains('C')) {
      return this.getOneValue('C');
    } else {
      return null;
    }
  },

  /**
   * Get the current Move.  Returns null if no move exists.
   *
   * Specifically, returns a dict:
   *  {
   *    color: <BLACK / WHITE>
   *    point: point
   *  }
   *
   * If the move is a pass, then in the SGF, we'll see B[] or W[].  Thus,
   * we will return { color: BLACK } or { color: WHITE }, but we won't have any
   * point associated with this.
   */
  getMove: function() {
    var BLACK = glift.enums.states.BLACK;
    var WHITE = glift.enums.states.WHITE;
    if (this.contains('B')) {
      if (this.getOneValue('B') === "") {
        return { color: BLACK }; // This is a PASS
      } else {
        return { color: BLACK, point: this.getAsPoint('B') }
      }
    } else if (this.contains('W')) {
      if (this.getOneValue('W') === "") {
        return { color: WHITE }; // This is a PASS
      } else {
        return { color: WHITE, point: this.getAsPoint('W') };
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
   * returns:
   *  {
   *    BLACK: [<move>, <move>, ...]
   *    WHITE: [...]
   *  }
   *
   *  where move is:
   *  {
   *    point: pt,
   *    color: color
   *  }
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
   */
  getAllMarks: function() {
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
          if (prop === glift.rules.allProperties.LB) {
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
   */
  // TODO(kashomon): Add test
  getGameInfo: function() {
    var gameInfoArr = [];
    // Probably should live in a more canonical place (properties.js).
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
        if (key === 'PW' && this.contains('WR')) {
          obj.value += ' [' + this.getOneValue('WR') + ']';
        } else if (key === 'PB' && this.contains('BR')) {
          obj.value += ' [' + this.getOneValue('BR') + ']';
        }
        // Remove trailing zeroes on komi amounts.
        else if (key === 'KM') {
          obj.value = parseFloat(this.getOneValue(key)) + '' || '0';
        }
        gameInfoArr.push(obj);
      }
    }
    return gameInfoArr;
  },

  /** Escapes some text by converting ] to \\] */
  escape: function(text) {
    return text.toString().replace(/]/g, '\\]');
  },

  /** Unescapes some text by converting \\] to ] */
  unescape: function(text) {
    return text.toString().replace(/\\]/g, ']');
  }
};

})();
