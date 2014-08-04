glift.global = {
  /**
   * Semantic versioning is used to determine API behavior.
   * See: http://semver.org/
   * Currently in alpha.
   */
  version: '0.15.3',
  debugMode: false,

  // Options for performanceDebugLevel: NONE, INFO
  performanceDebugLevel: 'NONE',

  // Map of performance timestamps.
  // TODO(kashomon): Indicate that this is private and what it's used for.
  perf: {},

  // The registry.  Used to determine who has 'ownership' of key-presses.
  // The problem is that key presses have to be captured in a global scope (or
  // at least at the <body> level.  Unfortunate.
  instanceRegistry: {
    // Map of manager ID (some-div-id-glift-1) to object instance.
  },

  // Id of the active instance.
  activeInstanceId: null
};
