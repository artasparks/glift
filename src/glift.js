/**
 * @preserve Glift: A Responsive Javascript library for the game Go.
 *
 * @copyright Josh Hoak
 * @license MIT License (see LICENSE.txt)
 * @version 1.1.1
 * --------------------------------------
 */


(function(w) {
// Define some closure primitives for compatibility with dev mode. Closure
// compiler works off of regular expressions, so this shouldn't be an issue.
// This allows us to use goog.require and goog.provides in dev mode.
if (!w['goog']) {
  w['goog'] = {}
  w['goog']['require'] = function(ns){};
  w['goog']['scope'] = function(fn) { fn() };
  w['goog']['provide'] = function(ns) { };
}

goog.provide('glift');

var glift = w.glift || {};
if (w) {
  // expose Glift as a global.
  w.glift = glift;
}
})(window);
