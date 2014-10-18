/**
 * Option defaults.
 *
 * Generally, there are three classes of options:
 *
 * 1. Manager Options. Meta options hoving to do with managing widgets.  These
 *    are generally at the top level.
 * 2. Display Options. Options having to do with how widgets are displayed
 * 3. SGF Options. Options having to do specifically with each SGF.
 *
 * Terminology:
 *  - I use SGF through this file and in Glift to refer to a go-data-file.  This
 *    is largely due to myopia early in the dev process. With the @api(1.X) in
 *    full sway, it's not possible to change this distinction. Regardless, it is
 *    possible that in the future, SGF strings and SGF URLs will grow to
 *    encompass other types go-data, like the Tygem .gib filetypes.
 *
 * API annotations:
 *  - @api(1.X) Indicates an option supported for the lifetime of the 1.X
 *    release.
 *  - @api(beta) Indicates an option currently slated to become a 1.X option.
 *  - @api(experimental) Indicates an option in testing.
 */
glift.widgets.options.baseOptions = {
  /**
   * The sgf parameter can be one of the following:
   *  - An SGF in literal string form.
   *  - A URL to an SGF.
   *  - An SGF Object, with parameters specified in SGF Defaults
   *
   * If sgf is specified as an object in can contain any of the options
   * specified in sgfDefaults.  In addition, the follow parameters may be
   * specified:
   *  - sgfString: a literal SGF String
   *  - initialPosition: where to start in the SGF
   *  - url: a url to an SGF. see sgfDefaults for va
   *
   * As you might expect, if the user sets sgf to a literal string form or to a
   * url, it is transformed into an SGF object internally.
   *
   * @api(1.0)
   */
  sgf: undefined,

  /**
   * The defaults or SGF objects. These are equivalent to the options used for
   * each SGF.  In other words, you can set these options either in each
   * individual SGF, or you may set these options in the SGF defaults. Some
   * options are specified here, but should only be specified in the individual
   * SGF (sgfString, url).
   *
   * @api(1.0)
   */
  sgfDefaults: {
    /**
     * A literal SGF String.  Should not be specified in SGF defaults
     * @api(1.0)
     */
    sgfString: undefined,

    /**
     * URL (usually relative) to an SGF. Once loaded, the resulting data is
     * cached to speed recall time.
     * @api(1.0)
     */
    url: undefined,

    /**
     * A name to by which an SGF String can be referred to later.  This is only
     * necessary for SGF Strings -- URLs are their own aliases.
     *
     * Note: If this feature is used, the SGF should be supplied in a SGF Mapping.
     * @api(experimental)
     */
    alias: undefined,

    /**
     * The default widget type. Specifies what type of widget to create.
     * @api(1.0)
     */
    widgetType: glift.enums.widgetTypes.GAME_VIEWER,

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
     * 2.3-4.1   - Start at the 1st variation of the 4th move, arrived at by
     *             traveling through the 3rd varition on the 2nd move
     * @api(1.0)
     */
    initialPosition: '',

    /**
     * The board region to display.  The boardRegion will be 'guessed' if it's set
     * to 'AUTO'.
     * @api(1.0)
     */
    boardRegion: glift.enums.boardRegions.AUTO,

    /**
     * What rotation to apply to -just- the display of the stones. Any of:
     * NO_ROTATION, CLOCKWISE_90, CLOCKWISE_180, CLOCKWISE_270, or undefined;
     * @api(beta)
     */
    rotation: glift.enums.rotations.NO_ROTATION,

    /**
     * Callback to perform once a problem is considered correct / incorrect.
     * @api(beta)
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
     * @api(1.0)
     */
    problemConditions: {
      GB: [],
      C: ['Correct', 'is correct', 'is the correct']
    },

    /**
     * Specifies what action to perform based on a particular keystroke.  In
     * otherwords, a mapping from key-enum to action path.
     * See glift.keyMappings
     * @api(beta)
     */
    keyMappings: {
      ARROW_LEFT: 'iconActions.chevron-left.click',
      ARROW_RIGHT: 'iconActions.chevron-right.click'
    },

    /**
     * The UI Components to use for this display.
     * @api(1.0)
     */
    uiComponents: [
      'BOARD',
      'COMMENT_BOX',
      'STATUS_BAR',
      'ICONBAR'
    ],

    /**
     * Icons to use in the status bar.
     * @api(1.0)
     */
    // TODO(kashomon): Make per widget type (mv num not necessary for problems?)
    // TODO(kashomon): Enable settings when ready
    statusBarIcons: [
      'game-info',
      'move-indicator',
      'fullscreen'
      // TODO(kashomon): Add a settings icon.
      // 'settings-wrench'
    ],

    /**
     * Metadata for this SGF.  Like the global metadata, this option is not
     * meant to be used directly by Glift but by other programs utilizing Glift
     * and so the metadata has no expected structure.
     * @api(experimental)
     */
    metadata: undefined,

    /**
     * For all correct, there are multiple correct answers that a user must get.
     * This allows us to specify (in ms) how long the user has until the problem
     * is automatically reset.
     *
     * Should be overridden by the widget options.
     */
    correctVariationsResetTime: undefined,

    /**
     * You can, if you wish, override the total number of correct variations
     * that a user must get correct. Currently only applies to
     * CORRECT_VARIATIONS_PROBLEM.
     */
    totalCorrectVariationsOverride: undefined,

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
    showVariations: 'MORE_THAN_ONE',

    /**
     * Whether or not to mark the last move played.  Either true or false, but
     * defaults to true.
     */
    markLastMove: true,

    /**
     * The function that creates the controller at widget-creation time.
     * See glift.controllers for more detail
     * @api(1.0)
     */
    controllerFunc: undefined,

    /**
     * The names of the icons to use in the icon-bar.  This is a list of
     * icon-names, which must be spceified in glift.displays.icons.svg.
     * @api(1.0)
     */
    icons: undefined,

    /**
     * The action that is performed when a sure clicks on an intersection.
     * @api(1.0)
     */
    stoneClick: undefined,

    /**
     * Mouseover/mouseout override for stones.
     */
    stoneMouseover: undefined,
    stoneMouseout: undefined
  },

  //----------------------------------------------------------------------
  // These are really Widget Manager options.  Any update to here must be
  // accompanied with an update to options.getDisplayOptions.
  //----------------------------------------------------------------------

  /**
   * The div id in which we create the go board.  The default is glift_display,
   * but this will almost certainly need to be set by the user.
   * @api(1.0)
   */
  divId: 'glift_display',

  /**
   * The SGF collection represents a set of SGFs. Like the Sgf parameter, this
   * can take one of three values:
   * - undefined (if the SGF parameter is defined)
   * - An array of SGF objects.
   * - A URL (to load the collection asynchronously).  The received data must be
   *   a JSON array, containing a list of serialized SGF objects.
   *
   * Once an SGF Collection is loaded, Glift looks through each entry in the
   * collection.  If an SGF URL is found, the SGF is loaded in the background
   * and cached.
   * @api(1.0)
   */
  sgfCollection: undefined,

  /**
   * An experimental feature. Create an association between.  This defines the
   * basis of the manager SGF cache.
   *
   * Expects the structure:
   *  {
   *    [name/alias]: <sgf string>
   *  }
   *
   * @api(experimental)
   */
  sgfMapping: undefined,

  /**
   * Index into the above collection.  This is mostly useful for remembering
   * someone's position in the sgf collection.
   * @api(1.0)
   */
  initialIndex: 0,

  /**
   * If there are multiple SGFs in the SGF list, this flag indicates whether or
   * not to allow the user to go back to the beginnig (or conversely, the end).
   * @api(experimental)
   */
  allowWrapAround: false,

  /**
   * Wether or not to load the the collection in the background via XHR requests.
   * @api(beta)
   */
  loadCollectionInBackground: true,

  /**
   * Global metadata for this set of options or SGF collection.  These is not
   * meant to be used directly by Glift but by other programs utilizing Glift
   * and so the metadata has no expected structure.
   * @api(experimental)
   */
  metadata: undefined,

  /**
   * Miscellaneous options for display.
   * @api(1.0)
   */
  display: {
    /**
     * Specify a background image for the go board.  You can specify an absolute
     * or a relative path.  As you may expect, you cannot do cross domain
     * requests.
     *
     * Examples:
     *  'images/kaya.jpg'
     *  'http://www.mywebbie.com/images/kaya.jpg'
     *
     * @api(1.0)
     */
    goBoardBackground: '',

    /**
     * The name of the theme to be used for this instance. Other themes include:
     *  - DEPTH (stones with shadows)
     *  - MOODY (gray background, no stone outlines)
     *  - TRANSPARENT (board is transparent)
     *  - TEXTBOOK (Everything black and white)
     * @api(1.0)
     */
    theme: 'DEFAULT',

    /**
     * On the edges of the board, draw the board coordinates.
     * - On the left, use the numbers 1-19
     * - On the bottom, use A-T (all letters minus I)
     * @api(1.0)
     */
    drawBoardCoords: false,

    /**
     * Split percentages to use for a one-column widget format.
     */
    oneColumnSplits: {
      first: [
        { component: 'STATUS_BAR',   ratio: 0.06 },
        { component: 'BOARD',       ratio: 0.67 },
        { component: 'COMMENT_BOX', ratio: 0.18 },
        { component: 'ICONBAR',     ratio: 0.09 }
      ]
    },

    /**
     * Split percentages to use for a two-column widget format.
     */
    twoColumnSplits: {
      first: [
        { component: 'BOARD', ratio: 1 }
      ],
      second: [
        { component: 'STATUS_BAR',     ratio: 0.07 },
        { component: 'COMMENT_BOX',   ratio: 0.83 },
        { component: 'ICONBAR',       ratio: 0.10 }
      ]
    },

    /** Previous SGF icon */
    previousSgfIcon: 'chevron-left',

    /** Next SGF Icon */
    nextSgfIcon: 'chevron-right',

    /** For convenience: Disable zoom for mobile users. */
    disableZoomForMobile: false,

    /**
     * Whether or not to enable keyboard shortcuts. This currently binds
     * keypress events to document.body, so it's not unlikely this could
     * conflict with other applications
     */
    enableKeyboardShortcuts: true
  },

  /**
   * Actions for stones.  If the user specifies his own actions, then the
   * actions specified by the user will take precedence.
   * @api(1.0)
   */
  stoneActions: {
    /**
     * click is specified in sgfOptions as stoneClick.  The actions that must
     * happen on each click vary for each widget, so we can't make a general
     * click function here.
     */
    click: undefined,

    /** Add ghost-stone for cursor hovering. */
    mouseover: function(event, widget, pt) {
      var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display.intersections()
            .setStoneColor(pt, hoverColors[currentPlayer]);
      }
    },

    /** Ghost-stone removal for cursor hovering. */
    mouseout: function(event, widget, pt) {
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display && widget.display.intersections()
            .setStoneColor(pt, 'EMPTY');
      }
    },

    // TODO(kashomon): It's not clear if we want this. Revisit later.
    touchend: function(event, widget, pt) {
      event.preventDefault && event.preventDefault();
      event.stopPropagation && event.stopPropagation();
      widget.sgfOptions.stoneClick(event, widget, pt);
    }
  },

  /**
   * The actions for the icons.  The keys in iconACtions
   */
  iconActions: {
    start: {
      click:  function(event, widget, icon, iconBar) {
        widget.applyBoardData(widget.controller.toBeginning());
      },
      tooltip: 'Go to the beginning'
    },

    end: {
      click:  function(event, widget, icon, iconBar) {
        widget.applyBoardData(widget.controller.toEnd());
      },
      tooltip: 'Go to the end'
    },

    arrowright: {
      click: function(event, widget, icon, iconBar) {
        widget.applyBoardData(widget.controller.nextMove());
      },
      tooltip: 'Next move'
    },

    arrowleft: {
      click:  function(event, widget, icon, iconBar) {
        widget.applyBoardData(widget.controller.prevMove());
      },
      tooltip: 'Previous move'
    },

    // Get next problem.
    'chevron-right': {
      click: function(event, widget, icon, iconBar) {
        widget.manager.nextSgf();
      },
      tooltip: 'Next panel'
    },

    // Get the previous problem.
    'chevron-left': {
      click: function(event, widget, icon, iconBar) {
        widget.manager.prevSgf();
      },
      tooltip: 'Previous panel'
    },

    // Try again
    refresh: {
      click: function(event, widget, icon, iconBar) {
        widget.reload();
      },
      tooltip: 'Try the problem again'
    },

    // Undo for just problems (i.e., back one move).
    'undo-problem-move': {
      click:  function(event, widget, icon, iconBar) {
        if (widget.controller.movetree.node().getNodeNum() <=
            widget.initialMoveNumber) {
          return;
        }

        if (widget.initialPlayerColor === widget.controller.getCurrentPlayer()) {
          // If it's our move, then the last move was by the opponent -- we need
          // an extra move backwards.
          widget.applyBoardData(widget.controller.prevMove());
        }

        widget.applyBoardData(widget.controller.prevMove());
        if (widget.initialMoveNumber ===
            widget.controller.movetree.node().getNodeNum()) {
          // We're at the root.  We can assume correctness, so reset the widget.
          widget.reload();
        } else {
          var problemResults = glift.enums.problemResults;
          var correctness = widget.controller.correctnessStatus();
          widget.iconBar.destroyTempIcons();
          if (correctness === problemResults.CORRECT) {
              widget.iconBar.setCenteredTempIcon(
                  'multiopen-boxonly', 'check', '#0CC');
              widget.correctness = problemResults.CORRECT;
          } else if (correctness === problemResults.INCORRECT) {
            widget.iconBar.destroyTempIcons();
            widget.iconBar.setCenteredTempIcon(
                'multiopen-boxonly', 'cross', 'red');
            widget.correctness = problemResults.INCORRECT;
          }
        }
      },
      tooltip: 'Undo last move attempt'
    },

    undo: {
      click: function(event, widget, icon, iconBar) {
        widget.manager.returnToOriginalWidget();
      },
      tooltip: 'Return to the parent widget'
    },

    'jump-left-arrow': {
      click: function(event, widget, icon, iconBar) {
        var maxMoves = 20;
        widget.applyBoardData(widget.controller.previousCommentOrBranch(maxMoves));
      },
      tooltip: 'Previous branch or comment'
    },

    'jump-right-arrow': {
      click: function(event, widget, icon, iconBar) {
        var maxMoves = 20;
        widget.applyBoardData(widget.controller.nextCommentOrBranch(maxMoves));
      },
      tooltip: 'Previous branch or comment'
    },

    // Go to the explain-board for a problem.
    // (was roadmap)
    'problem-explanation': {
      click: function(event, widget, icon, iconBar) {
        var manager = widget.manager;
        var sgfObj = {
          widgetType: glift.enums.widgetTypes.GAME_VIEWER,
          initialPosition: widget.controller.initialPosition,
          sgfString: widget.controller.originalSgf(),
          showVariations: glift.enums.showVariations.ALWAYS,
          problemConditions: glift.util.simpleClone(
              widget.sgfOptions.problemConditions),
          icons: [
            'jump-left-arrow',
            'jump-right-arrow',
            'arrowleft',
            'arrowright',
            'undo'
          ],
          rotation: widget.sgfOptions.rotation,
          boardRegion: widget.sgfOptions.boardRegion
        }
        manager.createTemporaryWidget(sgfObj);
      },
      tooltip: 'Explore the solution'
    },

    multiopen: {
      click: function(event, widget, icon, iconBar) {
        var ic = glift.displays.icons.iconSelector(
            widget.wrapperDiv,
            iconBar.divId,
            icon);
        ic.setIconEvents('click', function(event, wrappedIcon) {
          var multi = iconBar.getIcon('multiopen')
          multi.setActive(wrappedIcon.iconName);
          iconBar.setCenteredTempIcon('multiopen', multi.getActive(), 'black');
        });
      }
    },

    'multiopen-boxonly': {
      mouseover: function() {},
      mouseout: function() {},
      click: function() {},
      tooltip: 'Shows if the problem is solved'
    },

    //////////////////////
    // Status Bar Icons //
    //////////////////////

    'game-info': {
      click: function(event, widget, icon, iconBar) {
        widget.statusBar &&
        widget.statusBar.gameInfo(
            widget.controller.getGameInfo(),
            widget.controller.getCaptureCount());
      },
      tooltip: 'Show the game info'
    },

    'move-indicator': {
      click: function() {},
      mouseover: function() {},
      mouseout: function() {},
      tooltip: 'Shows the current move number'
    },

    fullscreen: {
      click: function(event, widget, icon, iconBar) {
        widget.statusBar && widget.statusBar.fullscreen();
      },
      tooltip: 'Expand display to fill entire screen.'
    },

    unfullscreen: {
      click: function(event, widget, icon, iconBar) {
        // We need to stop event propagation because often the un-fullscreen
        // button will be over some other clickable element.
        event.preventDefault && event.preventDefault();
        event.stopPropagation && event.stopPropagation();
        widget.statusBar && widget.statusBar.unfullscreen();
      },
      tooltip: 'Return display original size.'
    },

    'settings-wrench': {
      click: function() {},
      tooltip: 'Show Glift Settings'
    }
  }
};
