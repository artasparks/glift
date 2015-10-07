/**
 * @preserve Glift: A Responsive Javascript library for the game Go.
 *
 * @copyright Josh Hoak
 * @license MIT License (see LICENSE.txt)
 * @version 1.1.0
 * --------------------------------------
 */
(function(w) {
var glift = glift || w.glift || {};

// Define some closure primitives for backwards compatibility. Closure compiler
// works off of regular expressions, so this shouldn't be an issue.
var g = w.goog || {};
if (!g.provide) {
  g.provide = function(){};
}
if (!g.require) {
  g.require = function(){};
}

if (w) {
  // expose Glift as a global.
  w.glift = glift;
  w.goog = g;
}
})(window);
