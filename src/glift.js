// Glift: A lightweight Go frontend
// Copyright (c) 2011-2012, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License
glift = window.glift || {};

(function() {
glift.create = function(options) {
  var processed = glift.processOptions(options);
  var displayImpl = glift.displays.getImpl(processed);
  return new Glift(processed, displayImpl);
};

var Glift = function(inOptions, inDisplay) {
  // Private closure variables
  var options = inOptions;
  var display = inDisplay;

  // Methods accessing private data.
  this.theme = function() { return options.theme; };
  this.intersections = function() { return options.intersections; };
  this.divId = function() { return options.divId; };
  this.display = function() { return options.display; };
};
})();
