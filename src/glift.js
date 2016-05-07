/**
 * @preserve Glift: A Responsive Javascript library for the game Go.
 *
 * @copyright Josh Hoak
 * @license MIT License (see LICENSE.txt)
 * @version 1.1.1
 * --------------------------------------
 */

// Define some closure primitives for compatibility with dev mode. Closure
// compiler works off of regular expressions, so this shouldn't be an issue.
// This allows us to use goog.require and goog.provides in dev mode.
if (!window['goog']) {
  window['goog'] = {}
  window['goog']['provide'] = function(){};
  window['goog']['require'] = function(){};
  window['goog']['scope'] = function(fn) { fn() };
}

goog.provide('glift');

(function(w) {
var glift = w.glift || {};
if (w) {
  // expose Glift as a global.
  w.glift = glift;
}
})(window);
