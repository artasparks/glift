// Glift: A lightweight Go frontend
// Copyright (c) 2011-2012, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License

(function() {
var glift = window.glift || {};
glift.create = function(options) {
  return glift.displays.getImpl(options);
};
window.glift = glift;
})();
