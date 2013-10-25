/**
 * @preserve Glift: A Responsive Javascript library for the game Go.
 *
 * @version 1.0.1
 * @copyright Josh Hoak
 * @license MIT License (see LICENSE.txt)
 * --------------------------------------
 */
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
  version: '1.0.1',
  // The active registry.  Used to determine who has 'ownership' of key-presses.
  // (not used yet)
  active: {}
};

window.glift = glift;
})();
