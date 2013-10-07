// Glift: A lightweight Go frontend
// Copyright (c) 2011-2013, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License

(function() {
var glift = window.glift || {};

glift.global = {
  /**
   * Whether or not fast click is enabled, via Glift.
   */
  fastClickEnabled: false,
  enableFastClick: function() {
    if (!glift.global.fastClickEnabled) {
      FastClick.attach(document.body);
      glift.global.fastClickEnabled = true;
    }
  },
  // None of these are currently used
  debugMode: false,
  performanceDebug: false,
  version: '0.1.0',
  // The active registry.  Used to determine who has 'ownership' of key-presses.
  active: {
  }
};

window.glift = glift;
})();
