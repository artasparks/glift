// Glift: A lightweight Go frontend
// Copyright (c) 2011-2013, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License

(function() {
var glift = window.glift || {};
glift.createDisplay = function(options) {
  return glift.displays.getImpl(options);
};
window.glift = glift;
})();
