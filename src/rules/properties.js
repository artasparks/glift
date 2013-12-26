(function() {
glift.rules.properties = function(map) {
  return new Properties(map);
};

var Properties = function(map) {
  if (map === undefined) {
    this.propMap = {};
  } else {
    this.propMap = map;
  }
}

Properties.prototype = {
  /**
   * Add an SGF Property to the current move. Return the 'this', for
   * convenience, so that you can chain addProp calls.
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
    if (glift.sgf.allProperties[prop] === undefined) {
      throw "Can't add undefined properties";
    } else if (glift.util.typeOf(value) !== 'string' &&
        glift.util.typeOf(value) !== 'array') {
      // The value has to be either a string or an array.
      value = value.toString();
    }
    value = glift.util.typeOf(value) === 'string' ? [value] : value;

    // If the type is a string, make into an array or concat.
    if (this.contains(prop)) {
      this.propMap[prop] = this.getAllValues(prop).concat(value);
    } else {
      this.propMap[prop] = value;
    }
    return this;
  },

  /**
   * Return an array of data associated with a property key
   */
  getAllValues: function(strProp) {
    if (glift.sgf.allProperties[strProp] === undefined) {
      return glift.util.none; // Not a valid Property
    } else if (this.propMap[strProp] !== undefined) {
      return this.propMap[strProp];
    } else {
      return glift.util.none;
    }
  },

  /**
   * Get one piece of data associated with a property. Default to the first
   * element in the data associated with a property.
   *
   * Since the getOneValue() always returns an array, it's sometimes useful to
   * return the first property in the list.  Like getOneValue(), if a property
   * or value can't be found, util.none is returned.
   */
  getOneValue: function(strProp, index) {
    var index = (index !== undefined
        && typeof index === 'number' && index >= 0) ? index : 0;
    var arr = this.getAllValues(strProp);
    if (arr !== glift.util.none && arr.length >= 1) {
      return arr[index];
    } else {
      return glift.util.none;
    }
  },

  /**
   * Get a value from a property and return the point representation.
   * Optionally, the user can provide an index, since each property points to an
   * array of values.
   */
  getAsPoint: function(strProp, index) {
    var out = this.getOneValue(strProp, index);
    if (out === glift.util.none) {
      return out;
    } else {
      return glift.util.pointFromSgfCoord(out);
    }
  },

  /**
   * contains: Return true if the current move has the property "prop".  Return
   * false otherwise.
   */
  contains: function(prop) {
    return this.getAllValues(prop) !== glift.util.none;
  },

  /** Delete the prop and return the value. */
  remove: function(prop) {
    if (this.contains(prop)) {
      var allValues = this.getAllValues(prop);
      delete this.propMap[prop];
      return allValues;
    } else {
      return glift.util.none;
    }
  },

  /**
   * Sets current value, even if the property already exists.
   */
  set: function(prop, value) {
    if (prop !== undefined && value !== undefined) {
      if (glift.util.typeOf(value) === 'string') {
        this.propMap[prop] = [value]
      } else if (glift.util.typeOf(value) === 'array') {
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

  getComment: function() {
    if (this.contains('C')) {
      return this.getOneValue('C');
    } else {
      return glift.util.none;
    }
  },

  /**
   * Get the current Move.  Returns util.none if no move exists.
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
      return glift.util.none;
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
        for (var i = 0; i < allValues.length; i++) {
          for (var j = 0; j < substrings.length; j++) {
            var value = allValues[i];
            var substr = substrings[j];
            if (value.indexOf(substr) !== -1) {
              return true;
            }
          }
        }
      }
    }
    return false
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
    if (move != glift.util.none && move.point !== undefined) {
      out[move.color].push(move.point);
    }
    return out;
  }
};

})();
