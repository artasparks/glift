(function() {
glift.rules.properties = function(map) {
  return new Properties(map);
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
    if (!glift.sgf.allProperties[prop]) {
      glift.util.logz('Warning! The property [' + prop + ']' +
          ' is not valid and is not recognized in the SGF spec.');
    }

    if (glift.util.typeOf(value) !== 'string' &&
        glift.util.typeOf(value) !== 'array') {
      // The value has to be either a string or an array.  Maybe we should throw
      // an error?
      value = [ value.toString().replace('\\]', ']') ];
    } else if (glift.util.typeOf(value) === 'array') {
      // Force all array values to be of type string.
      for (var i = 0, len = value.length; i < len; i++) {
        if (glift.util.typeOf(value[i]) !== 'string') {
          value[i] = value[i].toString().replace('\\]', ']');
        }
      }
    } else if (glift.util.typeOf(value === 'string')) {
      value = [ value.replace('\\]', ']') ];
    } else {
      throw new Error('Unexpected type ' +
          glift.util.typeOf(value) + ' for item ' + item);
    }

    // If the type is a string, make into an array or concat.
    if (this.contains(prop)) {
      this.propMap[prop] = this.getAllValues(prop).concat(value);
    } else {
      this.propMap[prop] = value;
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
    if (glift.sgf.allProperties[strProp] === undefined) {
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
        this.propMap[prop] = [ value.replace('\\]', ']') ];
      } else if (glift.util.typeOf(value) === 'array') {
        for (var i = 0; i < value.length; i++) {
          if (glift.util.typeOf(value[i]) !== 'string') {
            throw new Error('When setting via an array, all values ' +
              'must be strings. was [' + glift.util.typeOf(value[i]) +
              '], for value ' + value[i]);
          }
          value[i] = value[i].replace('\\]', ']');
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
    var prop = "";
    if (color === glift.enums.states.BLACK) {
      prop = glift.sgf.allProperties.AB;
    } else if (color === glift.enums.states.WHITE) {
      prop = glift.sgf.allProperties.AW;
    }
    if (prop === "" || !this.contains(prop)) {
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
   *    BLACK: <pts>
   *    WHITE: <pts>
   *  }
   */
  getAllStones: function() {
    var states = glift.enums.states,
        out = {},
        BLACK = states.BLACK,
        WHITE = states.WHITE;
    out[BLACK] = this.getPlacementsAsPoints(states.BLACK);
    out[WHITE] = this.getPlacementsAsPoints(states.WHITE);
    var move = this.getMove();
    if (move && move.point) {
      out[move.color].push(move.point);
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
  getGameInfo: function() {
    var gameInfoArr = [];
    // Probably should live in a more canonical place (properties.js).
    var propNameMap = {
      GN: 'Game Name',
      PW: 'White Player',
      PB: 'Black Player',
      RE: 'Result',
      AN: 'Commenter',
      SO: 'Source',
      RU: 'Ruleset',
      KM: 'Komi'
    };
    for (var key in propNameMap) {
      if (this.contains(key)) {
        var displayName = propNameMap[key];
        gameInfoArr.push({
          prop: key,
          displayName: displayName,
          value: this.getOneValue(key)
        });
      }
    }
    return gameInfoArr;
  }
};

})();
