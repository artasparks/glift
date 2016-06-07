goog.provide('glift.global');

/**
 * Useful global variables related to all glift instances on the page.
 */
glift.global = {
  /**
   * Semantic versioning is used to determine API behavior.
   * See: http://semver.org/
   * Currently on stable.
   */
  version: '1.1.1',

  /**
   * The registry.  Used to determine who has 'ownership' of key-presses.
   * The problem is that key presses have to be captured in a global scope (or
   * at least at the <body> level.
   */
  instanceRegistry: {
    // Map of manager ID (some-div-id-glift-1) to object instance.
  },

  /**
   * ID of the active Glift instance.
   */
  activeInstanceId: null,

  /** Used to mark whether the zoom has been disabled (for mobile). */
  disabledZoom: false,

  /** Added CSS classes (we only want to do this once). */
  addedCssClasses: false
};
