// Glift: A lightweight Go frontend
// Copyright (c) 2011-2013, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License

(function() {
var glift = window.glift || {};

glift.global = {
  // Neither of these are currently used
  debugMode: false,
  performanceDebug: false,
  version: '0.1.0',
  // The active registry.  Used to determine who has 'ownership' of key-presses.
  active: {

  }
};

window.glift = glift;
})();
