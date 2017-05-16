goog.provide('glift.api.SgfOptions');
goog.provide('glift.api.WidgetTypeOptions');

/**
 * SGF Options specifically overridden from a specific widget type.
 *
 * See glift.api.SgfOptions for more details
 *
 * Notes:
 * - The first four params are optional.
 * - The the rest are required.
 *
 * @typedef {{
 *  keyMappings: (!Object<string>|undefined),
 *  markLastMove: (boolean|undefined),
 *  problemConditions: (!glift.rules.ProblemConditions|undefined),
 *  controllerFunc: !glift.controllers.ControllerFunc,
 *  icons: !Array<string>,
 *  showVariations: glift.enums.showVariations,
 *  statusBarIcons: !Array<string>,
 *  stoneClick: !glift.api.StoneFn,
 *  stoneMouseover: (glift.api.StoneFn|undefined),
 *  stoneMouseout: (glift.api.StoneFn|undefined)
 * }}
 */
glift.api.WidgetTypeOptions;

/**
 * The defaults for SGF objects. These are equivalent to the options used for
 * each SGF.  In other words, you can set these options either in each
 * individual SGF, or you may set these options in the SGF defaults. Some
 * options are specified here, but should only be specified in the individual
 * SGF (sgfString, url).
 *
 * @constructor @final @struct
 *
 * @param {glift.api.SgfOptions=} opt_o Options which may be partially filled
 *    out.
 */
glift.api.SgfOptions = function(opt_o) {
  var o = opt_o || {};

  /**
   * A literal SGF String. This is often overwritten when the SGF String is
   * retrived via an AJAX call and so thus **cannot be const**.
   *
   * @type {string|undefined}
   */
  this.sgfString = o.sgfString !== undefined ? o.sgfString : undefined;

  /**
   * URL (usually relative) to an SGF. Once loaded, the resulting data is
   * cached to speed recall time.
   * api:1.0
   *
   * @const {string|undefined}
   */
  this.url = o.url !== undefined ? o.url : undefined;

  /**
   * A name to by which an SGF String can be referred to later.  This is only
   * necessary for SGF Strings -- URLs are their own aliases.
   *
   * Note: If this feature is used, the SGF should be supplied in a SGF Mapping.
   * api:experimental
   *
   * @const {string|undefined}
   */
  this.alias = o.alias !== undefined ? o.alias : undefined;

  /**
   * Parsing type.  Defaults to SGF. Supports:
   *  SGF
   *  TYGEM
   *  PANDANET
   *
   * api:beta
   * @const {glift.parse.parseType}
   */
  this.parseType = o.parseType || glift.parse.parseType.SGF;

  /**
   * The default widget type. Specifies what type of widget to create.
   *
   * api:1.0
   *
   * @const {glift.WidgetType}
   */
  this.widgetType = o.widgetType || glift.WidgetType.GAME_VIEWER;

  /**
   * Defines where to start on the go board. An empty string implies the very
   * beginning, which is equally equivalent to 0 or [0].
   *
   * Rather than describe how you can detail the paths, here are some examples
   * of ways to specify an initial position.
   * 0         - Start at the 0th move (the root node)
   * 1         - Start at the 1st move.
   * 53        - Start at the 53rd move, taking the primary (main-line) path
   * 2.3       - Start at the 3rd variation on move 2 (actually move 3)
   * 3         - Start at the 3rd move, going through all the top variations
   * 2.0       - Start at the 3rd move, going through all the top variations
   * 0.0.0.0   - Start at the 3rd move, going through all the top variations
   * 0+        - Go to the end of the game
   * 2.3+      - Start at the 3rd variation on move 2, and go to the end
   *
   * api:1.0
   * @const {string|!Array<number>}
   */
  this.initialPosition = o.initialPosition || '';

  /**
   * The next moves path indicates moves that should be played past the
   * initial position. This should only be used for 'EXAMPLE' types and is
   * meant to simulate print diagriams.
   *
   * The next moves path is a path similar to the initial position in that it
   * specifies a path.  However, it's more restricted because we can't specify
   * move numbers -- only variation numbers -- since a next moves path is a
   * path fragment. Moreover, the first number is interpreted as a variation
   * number rather than a move number, as is the case for the initial
   * position.
   *
   * In otherwords, these are allowed:
   *  1         - Go through the 1st variation
   *  0.0.0.0   - Go through the 0th varation 4 times
   *  2.3       - Go through the 2nd variation and the 3rd variation
   *  2.0+      - Go through the 2nd variation and go to the end.
   *
   * These are not:
   *  2-3
   *
   * api:1.1
   * @const {string|!Array<number>}
   */
  this.nextMovesPath = o.nextMovesPath || '';

  /**
   * The board region to display.  The boardRegion will be 'guessed' if it's set
   * to 'AUTO'.
   *
   * api:1.0
   * @const {glift.enums.boardRegions}
   */
  this.boardRegion = o.boardRegion || glift.enums.boardRegions.AUTO;

  /**
   * What rotation to apply to -just- the display of the stones. Any of:
   * NO_ROTATION, CLOCKWISE_90, CLOCKWISE_180, CLOCKWISE_270, or undefined;
   *
   * api:beta
   * @const {glift.enums.rotations}
   */
  this.rotation = o.rotation || glift.enums.rotations.NO_ROTATION;

  /**
   * The UI Components to use for this display.
   *
   * api:1.0
   * @const {!Array<glift.BoardComponent>}
   */
  this.uiComponents = o.uiComponents || [
    glift.BoardComponent.BOARD,
    glift.BoardComponent.COMMENT_BOX,
    glift.BoardComponent.STATUS_BAR,
    glift.BoardComponent.ICONBAR
  ];

  /**
   * Convenience variables for disabling ui components.
   *
   * api:1.0
   * @const {boolean}
   */
  this.disableStatusBar = !!o.disableStatusBar || false;
  /**
   * api:1.0
   * @const {boolean}
   */
  this.disableBoard = !!o.disableBoard || false;
  /**
   * api:1.0
   * @const {boolean}
   */
  this.disableCommentBox = !!o.disableCommentBox || false;
  /**
   * api:1.0
   * @const {boolean}
   */
  this.disableIconBar = !!o.disableIconBar || false;

  /**
   * Metadata for this SGF.  Like the global metadata, this option is not
   * meant to be used directly by Glift but by other programs utilizing Glift
   * and so the metadata has no expected structure.
   *
   * api:experimental
   *
   * @const {!Object|undefined}
   */
  this.metadata = o.metadata || undefined;

  /**
   * For all correct, there are multiple correct answers that a user must get.
   * This allows us to specify (in ms) how long the user has until the problem
   * is automatically reset.
   *
   * Should be overridden by the widget options.
   *
   * api:experimental
   * @const {number|undefined}
   */
  this.correctVariationsResetTime =
      o.correctVariationsResetTime !== undefined ?
      o.correctVariationsResetTime : 750; // ms

  /**
   * You can, if you wish, override the total number of correct variations
   * that a user must get correct. Currently only applies to
   * CORRECT_VARIATIONS_PROBLEM.
   *
   * api:experimental
   * @const {number|undefined}
   */
  this.totalCorrectVariationsOverride =
      o.totalCorrectVariationsOverride || undefined;

  /**
   * Whether or not to mark ko locations.  Either true or false, but
   * defaults to true.
   *
   * api:1.0
   * @const {boolean}
   */
  this.markKo = o.markKo !== undefined ? !!o.markKo: true;

  /**
   * Hook options for SGFs.
   *
   * api:experimental
   * @const {!glift.api.HookOptions}
   */
  this.hooks = new glift.api.HookOptions(o.hooks);

  //-------------------------------------------------------------------------
  // These options must always be overriden by the widget type overrides.
  //
  // This could easily be changed, but right now this exists as a reminder to
  // the widget creator that they should override these options. In practice,
  // it seems that these particular options need to be set on a per-widget
  // basis anyway.
  //-------------------------------------------------------------------------

  /**
   * Icons to use in the status bar.
   *
   * Note: These should be defined by the type-specific options.
   *
   * An example of what this looks like in practice:
   *
   * [
   *   'game-info',
   *   'move-indicator',
   *   'fullscreen'
   *   'settings-wrench'
   * ],
   *
   * api:1.0
   * @const {!Array<string>|undefined}
   */
  this.statusBarIcons = o.statusBarIcons || undefined;

  /**
   * Specifies what action to perform based on a particular keystroke.  In
   * otherwords, a mapping from key-enum to action path.
   * See glift.keyMappings
   *
   * api:beta
   * @const {!Object<string>}
   */
  this.keyMappings = o.keyMappings || {
    ARROW_LEFT: 'iconActions.chevron-left.click',
    ARROW_RIGHT: 'iconActions.chevron-right.click'
  };

  /**
   * Conditions for determing whether a branch of a movetree is correct.  A
   * map from property-keys, to an array of substring values.  If the array is
   * empty, then we only test to see if the property exists at the current
   * positien.
   *
   * The default tests whether there is a 'GB' property or a 'C' (comment)
   * property containing 'Correct' or 'is correct'.
   *
   * api:1.0
   * @const {!glift.rules.ProblemConditions}
   */
  this.problemConditions = o.problemConditions || {
    GB: [],
    C: ['Correct', 'is correct', 'is the correct']
  };

  /**
   * This option indicates when, in the tree, the problem be marked 'incorrect'
   * or 'correct'.
   *
   * api:experimental
   * @const {string}
   */
  this.problemTermination = 'INCORRECT_PATH'

  /**
   * Whether or not to show variations.  See glift.enums.showVariations
   * Values: NEVER, ALWAYS, MORE_THAN_ONE
   *
   * api:1.0
   * @const {glift.enums.showVariations}
   */
  this.showVariations = o.showVariations ||
      glift.enums.showVariations.MORE_THAN_ONE;

  /**
   * Whether or not to mark the last move played.  Either true or false, but
   * defaults to true.
   *
   * @const {boolean}
   */
  this.markLastMove = o.markLastMove !== undefined ? !!o.markLastMove : true;


  /**
   * Whether or not to enable the mousewheel for game viewing. Scrolling up
   * advances the game and scrolling down goes backwards.
   *
   * @const {boolean}
   */
  this.enableMousewheel = o.enableMousewheel || false;

  /**
   * The function that creates the controller at widget-creation time.
   * See glift.controllers for more detail
   *
   * api:1.0
   * @const {!glift.controllers.ControllerFunc|undefined}
   */
  this.controllerFunc = o.controllerFunc || undefined;

  /**
   * The names of the icons to use in the icon-bar.  This is a list of
   * icon-names, which must be spceified in glift.displays.icons.svg.
   *
   * api:1.0
   * @const {!Array<string>|undefined}
   */
  this.icons = o.icons || undefined;

  /**
   * The action that is performed when a sure clicks on an intersection.
   *
   * api:1.0
   * @const {!glift.api.StoneFn|undefined}
   */
  this.stoneClick = o.stoneClick || undefined;

  /**
   * Mouseover/mouseout override for stones.
   * @const {!glift.api.StoneFn}
   */
  this.stoneMouseover = o.stoneMouseover || undefined;

  /**
   * @const {!glift.api.StoneFn}
   */
  this.stoneMouseout = o.stoneMouseout || undefined;
};

glift.api.SgfOptions.prototype = {
  /**
   * Set some defaults in the sgf object.  This does two passes of 'option'
   * settings.  First we apply the sgfOptions. Then, we apply the
   * widgetOverrides to any options not already filled in.
   *
   * sgf: An object {...} with some settings specified by sgfDefaults.
   * sgfDefaults: Processed SGF defaults.
   *
   * @param {!Object} sgf The raw SGF object.
   *
   * @return {!glift.api.SgfOptions} The completed SGF options, which can be then
   * used by the widget manager and the controller.
   */
  createSgfObj: function(sgf) {
    if (glift.util.typeOf(sgf) !== 'object') {
      throw new Error('SGF must be of type object, was: '
          + glift.util.typeOf(sgf) + ', for ' + sgf);
    }

    var widgetType = sgf.widgetType || this.widgetType;
    var widgetOverrides = glift.api.widgetopt[widgetType]();
    for (var key in widgetOverrides) {
      if (!sgf[key] && widgetOverrides[key] !== undefined) {
        sgf[key] = glift.util.simpleClone(widgetOverrides[key]);
      }
    }

    var sdef = /** @type {!Object} */ (this);
    for (var key in sdef) {
      if (!sgf[key] && sdef[key] !== undefined && key !== 'createSgfObj') {
        sgf[key] = sdef[key];
      }
    }

    return new glift.api.SgfOptions(/** @type {!glift.api.SgfOptions} */ (sgf));
  }
};
