// Glift: A lightweight Go frontend
// Copyright (c) 2011-2013, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License

(function() {
var glift = window.glift || {};

/**
 * Create a Glift Display
 */
glift.createDisplay = function(options) {
  return glift.displays.create(options);
};

glift.createController = function(options) {
  return glift.controllers.create(options);
};

window.glift = glift;
})();
