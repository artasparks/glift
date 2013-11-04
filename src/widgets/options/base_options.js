/**
 * Option defaults used by the BaseWidget.
 */
glift.widgets.options.base = {
  //--------------------------------------------------------------------------
  // These are first two really widget Manager Options, but I'm not too keen to
  // expose the manager as an abstraction.
  //--------------------------------------------------------------------------

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

  //--------------------------------------------------------------------------
  // The rest of the options are the set of immutable options for the widget.
  // It is assumed that these options are immutable for the life the widget
  // manager instance.
  //--------------------------------------------------------------------------

  /**
   * The div id in which we create the go board.  The default is glift_display.
   */
  divId: 'glift_display',


  /**
   * A default for setting the widget type.
   */
  defaultWidgetType: 'GAME_VIEWER',

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
   * Conditions for determing whether a branch of a movetree is correct.  A
   * map from property-keys, to an array of substring values.  If the array is
   * empty, then we only test to see if the property exists at the current
   * positien.
   *
   * The default tests whether there is a 'GB' property or a 'C' (comment)
   * property containing 'Correct' or 'is correct'.
   */
  defaultProblemConditions: {
    GB: [],
    C: ['Correct', 'is correct']
  },

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

  iconActions: undefined // filled in later
};
