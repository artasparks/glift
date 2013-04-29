// Glift
// Copyright (c) 2011-2012, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License
glift = window.glift || {};

(function() {
glift.create = function(options) {
  new Glift(options);
};


// Base object
var Glift = function(options) {
  this.options = options;
};

})();
