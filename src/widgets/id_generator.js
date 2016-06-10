goog.require('glift.widgets');

(function() {

// TODO(kashomon): This isn't really widgets specific, but it's only being used
// in this directory. Long term, it perhaps needs a better resting place.
// However, since the IDs are used to disambiguate different instances of glift,
// perhaps this is an ok location.

/**
 * Generates sequential numbers unique across all Glift instances on the page.
 *
 * @private
 * @constructor @final @struct
 * @param {number} seed
 */
var IdGenerator = function(seed) {
  seed  = seed || 0;

  /** @return {string} Return the next ID as a string. */
  this.next = function() {
    var out = seed + "";
    seed += 1
    return out;
  }
};

glift.widgets.idGenerator = new IdGenerator(0);

})();
