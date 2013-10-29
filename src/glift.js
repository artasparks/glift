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
  debugMode: false,
  // Options for performanceDebugLevel: none, fine, info
  performanceDebugLevel: 'none',
  // Map of performance timestamps.
  perf: {},
  // TODO(kashomon): Update the minor minor version based on commits.
  version: '1.0.1',
  // The active registry.  Used to determine who has 'ownership' of key-presses.
  // The problem is that key presses have to be captured in a global scope (or
  // at least at the <body> level.  Unfortunate.
  // (not used yet).
  active: {}
};

window.glift = glift;
})();
