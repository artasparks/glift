glift.global = {
  /**
   * Semantic versioning is used to determine API behavior.
   * See: http://semver.org/
   * Currently in alpha.
   */
  version: '0.9.2',
  debugMode: false,
  // Options for performanceDebugLevel: NONE, INFO
  performanceDebugLevel: 'NONE',
  // Map of performance timestamps.
  perf: {},
  // The active registry.  Used to determine who has 'ownership' of key-presses.
  // The problem is that key presses have to be captured in a global scope (or
  // at least at the <body> level.  Unfortunate.
  // (not used yet).
  active: {}
};
