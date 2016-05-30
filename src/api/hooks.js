goog.provide('glift.api.HookOptions');

/**
 * Hooks/callbacks for integrating with glift.
 *
 * @param {!glift.api.HookOptions=} opt_o Optional options.
 *
 * @constructor @final @struct
 */
glift.api.HookOptions = function(opt_o) {
  var o = opt_o || {};

  /**
   * Instead of an SGF collection, users can provide a getNextSgf function.
   * This means that the SGFs in a are stored external to Glift (e.g., on a
   * problem-server).
   *
   * Has the format: function(callback)
   *
   * The call back always expects an sgf object, which has the form:
   *  {
   *    sgfString: <string-sgf contents>
   *    alias: <string for cache-hits>
   *  }
   *
   * @type {(function()|undefined)}
   */
  this.getNextSgf = o.getNextSgf || undefined;

  /**
   * Fires when user gets a problem correct. This is a notification function
   * only.
   *
   * @type {(function()|undefined)}
   */
  this.problemCorrect = o.problemCorrect || undefined;

  /**
   * Fires when user gets a problem wrong.
   *
   * @type {(function()|undefined)}
   */
  this.problemIncorrect = o.problemIncorrect || undefined;
};
