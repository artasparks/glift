// Glift: A lightweight Go frontend
// Copyright (c) 2011-2013, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License

(function() {
var glift = window.glift || {};

/**
 * Create a Glift Display
 *
 * TODO(kashomon): Perhaps remove this?
 */
glift.createDisplay = function(options) {
  return glift.displays.create(options);
};

glift.global = {
  // Neither of these are currently used
  debugMode: false,
  performanceDebug: false
};

window.glift = glift;
})();
