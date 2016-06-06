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
if (window && !window['goog']) {
  window['goog'] = {}
  window['goog']['require'] = function(ns) {
    var nsParts = ns.split('.');
    var curNs = window;
    for (var i = 0; i < nsParts.length; i++) {
      var part = nsParts[i];
      if (!curNs[part]) {
        curNs[part] = {};
      }
      curNs = curNs[part];
    }
  };
  window['goog']['scope'] = function(fn) { fn() };
  window['goog']['provide'] = function(ns) { };
}

goog.provide('glift');

(function(w) {

var glift = w.glift || {};
if (w) {
  // expose Glift as a global.
  w.glift = glift;
}
})(window);
