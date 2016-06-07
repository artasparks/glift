goog.provide('glift.widgets.IdGenerator_');

goog.require('glift.widgets');

(function() {

/**
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
