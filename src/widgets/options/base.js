/**
 * Option defaults used by the BaseWidget.
 */
glift.widgets.options.base = {
  /**
   * A function that returns the controller.
   */
  controllerFunc: glift.controllers.gameViewer,

  /**
   * This is expected to be overwritten with a SGF in string form.
   */
  sgfString: '',

  /**
   * The default div id in which we create the go board.
   */
  divId: 'glift_display',

  /**
   * The name of the theme.
   */
  theme: 'DEFAULT',

  /**
   * The board region to display.  The boardRegion will be 'guessed' if it's set
   * to 'AUTO'.
   */
  boardRegionType: glift.enums.boardRegions.ALL,

  /**
   * Whether not to show the variations (as numbers).
   *
   * Can be 'NEVER', 'ALWAYS' or 'MORE_THAN_ONE'
   */
  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  /**
   * Whether or not to use the comment bar.
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
   * The default icons used in the IconBar.  If the user specifies 'icons', then
   * it completely overwrites the icons listed here.
   */
  icons: ['start', 'end', 'arrowleft', 'arrowright'],

  /**
   * Key Mapping: From key-id to action-selector.
   */
  keyMapping: {
    ARROW_LEFT: 'icons.arrowleft.mouseup',
    ARROW_RIGHT: 'icons.arrowright.mouseup'
  },

  /**
   * The default 'actions' or 'events'.  If the user specifies an 'actions'
   * block, then the users' actions take precedence, and these are used as a
   * fallback (i.e., for when the icon exists, but the user didn't specify an
   * action).
   */
  actions: {
    /**
     * Actions for stones.  If the user specifies his own actions, then the
     * actions specified by the user will take precedence.
     *
     * TODO(kashomon): Support touch events.  This is of tremendous importance.
     * The 300ms delay associated with click events on phones/tablets is
     * terrible.
     */
    stones: {
      /**
       * Actually adding a stone.
       */
      mouseup: function(widget, pt) {
        var currentPlayer = widget.controller.getCurrentPlayer();
        var partialData = widget.controller.addStone(pt, currentPlayer);
        widget.applyPartialData(partialData);
      },

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
          widget.display.intersections().setStoneColor(pt, 'EMPTY');
        }
      }
    },

    /**
     * Actions for Icons
     */
    icons: {
      start: {
        mouseup:  function(widget) {
          var fullBoardData = widget.controller.toBeginning();
          widget.applyFullBoardData(fullBoardData);
        }
      },
      end: {
        mouseup:  function(widget) {
          var fullBoardData = widget.controller.toEnd();
          widget.applyFullBoardData(fullBoardData);
        }
      },
      arrowright: {
        mouseup: function(widget) {
          var boardData = widget.controller.nextMove();
          widget.applyPartialData(boardData);
        }
      },
      arrowleft: {
        mouseup:  function(widget) {
          var boardData = widget.controller.prevMove();
          widget.applyPartialData(boardData);
        }
      }
    }
  }
};
