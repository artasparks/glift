goog.provide('glift.util.IdGenerator_');
goog.provide('glift.util.idGenerator');

goog.require('glift.util');

/**
 * @private
 * @constructor @final @struct
 */
glift.util.IdGenerator_ = function(seed) {
  this.seed  = seed || 0;
};

glift.util.IdGenerator_.prototype = {
  /**
   * @return {string} Return the next ID as a string.
   */
  next: function() {
    var out = this.seed + "";
    this.seed += 1
    return out;
  }
};

glift.util.idGenerator = new glift.util.IdGenerator_(0);
