goog.require('glift.global');

/**
 * Semantic versioning is used to determine API behavior. This is the version of
 * the Glift UI (which most people think of as Glift, anyway.
 *
 * See: http://semver.org/
 *
 * Currently on stable.
 */
glift.global.version = '1.2.0-alpha';

/**
 * The registry.  Used to determine who has 'ownership' of key-presses.
 * The problem is that key presses have to be captured in a global scope (or
 * at least at the <body> level.
 */
glift.global.instanceRegistry = {
  // Map of manager ID (some-div-id-glift-1) to object instance.
};

/**
 * ID of the active Glift instance.
 */
glift.global.activeInstanceId = null;

/** Used to mark whether the zoom has been disabled (for mobile). */
glift.global.disabledZoom = false;

/** Added CSS classes (we only want to do this once). */
glift.global.addedCssClasses = false;
