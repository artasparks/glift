/**
 * Option defaults.
 *
 * Generally, there are three classes of options:
 *
 * 1. Manager Options. Meta options hoving to do with managing widgets
 * 2. Display Options. Options having to do with how widgets are displayed
 * 3. Sgf Options. Options having to do specifically with each SGF.
 */
glift.widgets.options.baseOptions = {
  /**
   * The sgf parameter can be one of the following:
   *  - An SGF in literal string form.
   *  - A URL to an SGF.
   *  - An SGF Object.
   *
   * If sgf is specified as an object in can contain any of the options
   * specified in sgfDefaults.  In addition, the follow parameters may be
   * specified:
   *  - sgfString: a literal SGF String
   *  - initialPosition: where to start in the SGF
   *  - url: a url to
   *
   * As you might expect, if the user sets sgf to a literal string form or to a
   * url, it is transformed into an SGF object internally.
   */
  sgf: undefined,

  /**
   * The defaults or SGF objects.
   */
  sgfDefaults: {
    /**
     * The default widget type. Specifies what type of widget to create.
     */
    widgetType: glift.enums.widgetTypes.GAME_VIEWER,

    /**
     * Defines where to start on the go board. An empty string implies the very
     * beginning. Rather than describe how you can detail the paths, here are
     * some examples of ways to specify an initial position.
     * 0         - Start at the 0th move (the root node)
     * 1         - Start at the 1st move. This is often used in combination with
     *             a black pass to specify that white should play in a
     *             particular problem.
     * 53        - Start at the 53rd move, taking the primary path
     * 2.3       - Start at the 3rd variation on move 2 (actually move 3)
     * 3         - Start at the 3rd move, going through all the top variations
     * 2.0       - Start at the 3rd move, going through all the top variations
     * 0.0.0.0   - Start at the 3rd move, going through all the top variations
     * 2.3-4.1   - Start at the 1st variation of the 4th move, arrived at by
     *             traveling through the 3rd varition on the 2nd move
     */
    initialPosition: '',

    /**
     * The board region to display.  The boardRegion will be 'guessed' if it's set
     * to 'AUTO'.
     */
    boardRegion: glift.enums.boardRegions.AUTO,

    /**
     * Callback to perform once a problem is considered correct / incorrect.
     */
    problemCallback: function() {},

    /**
     * Conditions for determing whether a branch of a movetree is correct.  A
     * map from property-keys, to an array of substring values.  If the array is
     * empty, then we only test to see if the property exists at the current
     * positien.
     *
     * The default tests whether there is a 'GB' property or a 'C' (comment)
     * property containing 'Correct' or 'is correct'.
     */
    problemConditions: {
      GB: [],
      C: ['Correct', 'is correct']
    },

    /**
     * Specifies what action to perform based on a particular keystroke.  In
     * otherwords, a mapping from key-enum to action path.
     *
     * See glift.keyMappings
     */
    keyMappings: {
      ARROW_LEFT: 'iconActions.chevron-left.click',
      ARROW_RIGHT: 'iconActions.chevron-right.click'
    },

    //-------------------------------------------------------------------------
    // These options must always be overriden by the widget type overrides.
    //
    // This could easily be changed, but right now this exists as a reminder to
    // the widget creator that they should override these options. In practice,
    // it seems that these particular options need to be set on a per-widget
    // basis anyway.
    //-------------------------------------------------------------------------

    /**
     * Whether or not to show variations.  See glift.enums.showVariations
     * Values: NEVER, ALWAYS, MORE_THAN_ONE
     */
    showVariations: undefined,

    /**
     * The function that creates the controller at widget-creation time.
     * See glift.controllers for more detail
     */
    controllerFunc: undefined,

    /**
     * The icons to use in the icon-bar.  This is a list of icon-names, which
     * must be spceified in glift.displays.gui.icons.
     */
    icons: undefined,

    /**
     * The action that is performed when a sure clicks on an intersection.
     */
    stoneClick: undefined,

    /**
     * For all correct, there are multiple correct answers that a user must get.
     * This allows us to specify (in ms) how long the user has until the problem
     * is automatically reset.
     */
    correctVariationsResetTime: undefined,

    /**
     * You can, if you wish, override the total number of correct variations
     * that a user must get correct.
     */
    totalCorrectVariationsOverride: undefined
  },

  //----------------------------------------------------------------------
  // These are really widget Manager Options.  Any update to here must be
  // accompanied with an update to options.getDisplayOptions.
  //----------------------------------------------------------------------

  /**
   * The SGF list is a list of SGF objects (given above)
   */
  sgfList: [],

  /**
    * Index into the above list.  I can't imagine why anyone would want to change
    * the initial index for the sgfList, but it's here anyway for
    * configurability.
    */
  initialListIndex: 0,

  /**
   * If there are multiple SGFs in the SGF list, this flag indicates whether or
   * not to allow the user to go back to the beginnig (or conversely, the end).
   */
  allowWrapAround: false,

  //--------------------------------------------------------------------------
  // The rest of the options are the set of display options for the widget
  // It is assumed that these options are immutable for the life the widget
  // manager instance.
  //--------------------------------------------------------------------------

  /**
   * The div id in which we create the go board.  The default is glift_display,
   * but this will almost certainly need to be set by the user.
   */
  divId: 'glift_display',

  /**
   * Specify a background image for the go board.  You can specify an
   * absolute or a relative path.
   *
   * Examples:
   * 'images/kaya.jpg'
   * 'http://www.mywebbie.com/images/kaya.jpg'
   */
  goBoardBackground: '',

  /**
   * Whether or not to use the comment bar. It's possible this should be made
   * part of the SGF.
   */
  useCommentBar: true,

  /**
   * Div splits with the CommentBar.  Thus, there are three resulting divs - the
   * remainder is used by the last div - the icon bar.
   */
  splitsWithComments: [.70, .20],

  /**
   * Div splits without the comment bar.  Thus, there are two resulting divs -
   * the remainder is used by the last div -- the icon bar
   */
  splitsWithoutComments: [.90],

  /**
   * Div splits with only the comment bar.
   */
  splitsWithOnlyComments: [.80],

  /**
   * The name of the theme.
   */
  theme: 'DEFAULT',

  /**
   * Enable FastClick (for mobile displays).
   */
  enableFastClick: true,

  /**
   * Previous SGF icon
   */
  previousSgfIcon: 'chevron-left',

  /**
   * Next SGF Icon
   */
  nextSgfIcon: 'chevron-right',

  /**
   * Actions for stones.  If the user specifies his own actions, then the
   * actions specified by the user will take precedence.
   */
  stoneActions: {
    /**
     * click is specified in sgfOptions as stoneClick.  The actions that must
     * happen on each click vary for each widget, so we can't make a general
     * click function here.
     */
    click: undefined,

    /**
     * Ghost-stone for hovering.
     */
    mouseover: function(widget, pt) {
      var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display.intersections()
            .setStoneColor(pt, hoverColors[currentPlayer]);
      }
    },

    /**
     * Ghost-stone removal for hovering.
     */
    mouseout: function(widget, pt) {
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display &&
            widget.display.intersections().setStoneColor(pt, 'EMPTY');
      }
    }
  },

  /**
   * The actions for the icons.  The keys in iconACtions
   */
  iconActions: {
    start: {
      click:  function(widget) {
        widget.applyBoardData(widget.controller.toBeginning());
      }
    },

    end: {
      click:  function(widget) {
        widget.applyBoardData(widget.controller.toEnd());
      }
    },

    arrowright: {
      click: function(widget) {
        widget.applyBoardData(widget.controller.nextMove());
      }
    },

    arrowleft: {
      click:  function(widget) {
        widget.applyBoardData(widget.controller.prevMove());
      }
    },

    // Get next problem.
    'chevron-right': {
      click: function(widget) {
        widget.manager.nextSgf();
      }
    },

    // Get the previous problem.
    'chevron-left': {
      click: function(widget) {
        widget.manager.prevSgf();
      }
    },

    // Try again
    refresh: {
      click: function(widget) {
        widget.reload();
      }
    },

    undo: {
      click: function(widget) {
        widget.manager.returnToOriginalWidget();
      }
    },

    // Go to the explain-board.
    roadmap: {
      click: function(widget) {
        var manager = widget.manager;
        var sgfObj = {
          widgetType: glift.enums.widgetTypes.GAME_VIEWER,
          initialPosition: widget.sgfOptions.initialPosition,
          sgfString: widget.sgfOptions.sgfString,
          showVariations: glift.enums.showVariations.ALWAYS,
          problemConditions: glift.util.simpleClone(
              widget.sgfOptions.problemConditions),
          icons: ['start', 'end', 'arrowleft', 'arrowright', 'undo']
        }
        manager.createTemporaryWidget(sgfObj);
      }
    }
  }
};
