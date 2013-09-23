(function() {
var util = glift.util;
var enums = glift.enums;

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
    } else if (util.typeOf(value) !== 'string' &&
        util.typeOf(value) !== 'array') {
      // The value has to be either a string or an array.
      value = value.toString();
    }
    value = util.typeOf(value) === 'string' ? [value] : value;

    // If the type is a string, make into an array or concat.
    if (this.contains(prop)) {
      this.propMap[prop] = this.get(prop).concat(value);
    } else {
      this.propMap[prop] = value;
    }
    return this;
  },

  /**
   * Return an array of data associated with a property key
   */
  get: function(strProp) {
    if (glift.sgf.allProperties[strProp] === undefined) {
      util.debugl("attempted to retrieve a property that is not part"
           + " of the SGF Spec: " + strProp);
      return util.none;
    }
    if (this.propMap[strProp] !== undefined) {
      return this.propMap[strProp];
    } else {
      util.debugl("no property: " + strProp + " exists for the current move");
      return util.none;
    }
  },

  /**
   * Get one piece of data associated with a property. Default to the first
   * element in the data associated with a property.
   *
   * Since the get() always returns an array, it's sometimes useful to return
   * the first property in the list.  Like get(), if a property or value can't
   * be found, util.none is returned.
   */
  getDatum: function(strProp, index) {
    var index = (index !== undefined
        && typeof index === 'number' && index >= 0) ? index : 0;
    var arr = this.get(strProp);
    if (arr !== util.none && arr.length >= 1) {
      return arr[index];
    } else {
      return util.none;
    }
  },

  // Get a value from a property and return the point representation.
  // Optionally, the user can provide an index, since each property points to an
  // array of values.
  getAsPoint: function(strProp, index) {
    var out = this.getDatum(strProp, index);
    if (out === util.none) {
      return out;
    } else {
      return glift.util.pointFromSgfCoord(out);
    }
  },

  // contains: Return true if the current move has the property "prop".  Return
  // false otherwise.
  contains: function(prop) {
    return this.get(prop) !== util.none;
  },

  // Delete the prop and return the value.
  remove: function(prop) {
    if (this.contains(prop)) {
      var value = this.get(prop);
      delete this.propMap[prop];
      return value;
    } else {
      return util.none;
    }
  },

  // Replace replaces the current value if the property already exists.
  replace: function(prop, value) {
    this.propMap[prop] = value
  },

  //---------------------//
  // Convenience methods //
  //---------------------//

  // Get all the placements for a color (BLACK or WHITE).  Return as an array.
  getPlacementsAsPoints: function(color) {
    var prop = "";
    if (color === enums.states.BLACK) {
      prop = glift.sgf.allProperties.AB;
    } else if (color === enums.states.WHITE) {
      prop = glift.sgf.allProperties.AW;
    }

    if (prop === "" || !this.contains(prop)) {
      return [];
    }

    return glift.sgf.allSgfCoordsToPoints(this.get(prop));
  },

  getComment: function() {
    if (this.contains('C')) {
      return this.getDatum('C');
    } else {
      return util.none;
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
   */
  getMove: function() {
    if (this.contains('B')) {
      return {
        color: enums.states.BLACK,
        point: this.getAsPoint('B')
      };
    } else if (this.contains('W')) {
      return {
        color: enums.states.WHITE,
        point: this.getAsPoint('W')
      };
    } else {
      return util.none;
    }
  },

  isCorrect: function() {
    if (this.contains('GB')) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * Get all the stones (placements and moves)
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
    var move = this.getMove()
    if (move != util.none) {
      out[move.color].push(move.point);
    }
    return out;
  }
};

})();
