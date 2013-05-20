// Glift: A lightweight Go frontend
// Copyright (c) 2011-2012, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License
glift = window.glift || {};

(function() {
glift.create = function(options) {
  return glift.displays.getImpl(options);
};
})();
