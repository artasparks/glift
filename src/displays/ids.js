goog.provide('glift.displays.ids');
goog.provide('glift.displays.ids.Generator');

/**
 * Collection of ID utilities, mostly for SVG.
 */
glift.displays.ids = {
  /**
   * Create an ID generator.
   */
  generator: function(divId) {
    return new glift.displays.ids.Generator(divId);
  },

  /**
   * Get an ID for a SVG element (return the stringForm id).
   *
   * @param {string} divId
   * @param {glift.enums.svgElements} type
   * @param {glift.Point|Object|string=} opt_extraData
   * extraData may be undefined.  Usually a point, but also be an icon name.
   */
  element: function(divId, type, opt_extraData) {
    var base = divId + "_" + type;
    if (opt_extraData !== undefined) {
      if (opt_extraData.x !== undefined) {
        return base + '_' + opt_extraData.x() + "_" + opt_extraData.y();
      } else {
        return base + '_' + opt_extraData.toString();
      }
    } else {
      return base;
    }
  }
};

/**
 * Id Generator constructor.
 *
 * @constructor @final @struct
 */
glift.displays.ids.Generator = function(divId) {
  this.divId = divId;
  this._eid = glift.displays.ids.element;
  this._enum = glift.enums.svgElements;

  this._svg = this._eid(this.divId, this._enum.SVG);
  this._board = this._eid(this.divId, this._enum.BOARD);
  this._boardCoordLabelGroup =
      this._eid(this.divId, this._enum.BOARD_COORD_LABELS);
  this._stoneGroup = this._eid(this.divId, this._enum.STONE_CONTAINER);
  this._stoneShadowGroup =
      this._eid(this.divId, this._enum.STONE_SHADOW_CONTAINER);
  this._starpointGroup = this._eid(this.divId, this._enum.STARPOINT_CONTAINER);
  this._buttonGroup = this._eid(this.divId, this._enum.BUTTON_CONTAINER);
  this._boardButton = this._eid(this.divId, this._enum.FULL_BOARD_BUTTON);
  this._lineGroup = this._eid(this.divId, this._enum.BOARD_LINE_CONTAINER);
  this._markGroup = this._eid(this.divId, this._enum.MARK_CONTAINER);
  this._iconGroup = this._eid(this.divId, this._enum.ICON_CONTAINER);
  this._intersectionsGroup = this._eid(this.divId, this._enum.BOARD);
      this._eid(this.divId, this._enum.INTERSECTIONS_CONTAINER);
  this._tempMarkGroup = this._eid(this.divId, this._enum.TEMP_MARK_CONTAINER);
};

glift.displays.ids.Generator.prototype = {
  /** ID for the svg container. */
  svg: function() { return this._svg; },

  /** ID for the board. */
  board: function() { return this._board; },

  /** Group id for the board coordinate label group */
  boardCoordLabelGroup: function() { return this._boardCoordLabelGroup; },

  /** ID for the intersections group. */
  intersections: function() { return this._intersectionsGroup; },

  /** Group id for the stones. */
  stoneGroup: function() { return this._stoneGroup; },

  /** Id for a stone. */
  stone: function(pt) { return this._eid(this.divId, this._enum.STONE, pt); },

  /** Group id for the stone shadows. */
  stoneShadowGroup: function() { return this._stoneShadowGroup; },

  /** ID for a stone shadow. */
  stoneShadow: function(pt) {
    return this._eid(this.divId, this._enum.STONE_SHADOW, pt);
  },

  /** Group id for the star points. */
  starpointGroup: function() { return this._starpointGroup; },

  /** ID for a star point. */
  starpoint: function(pt) {
    return this._eid(this.divId, this._enum.STARPOINT, pt);
  },

  /** Group id for the buttons. */
  buttonGroup: function() { return this._buttonGroup; },

  /** ID for a button. */
  button: function(name) {
    return this._eid(this.divId, this._enum.BUTTON, name);
  },

  /** ID for a full-board button. */
  fullBoardButton: function() { return this._boardButton; },

  /** Group id for the lines. */
  lineGroup: function() { return this._lineGroup; },

  /** ID for a line. */
  line: function(pt) {
    return this._eid(this.divId, this._enum.BOARD_LINE, pt);
  },

  /** Group id a Mark Container. */
  markGroup: function() { return this._markGroup; },

  /** ID for a mark. */
  mark: function(pt) {
    return this._eid(this.divId, this._enum.MARK, pt);
  },

  /** Group id for temporary marks. */
  tempMarkGroup: function() {
    return this._tempMarkGroup;
  },

  /** ID for a guideline. */
  guideLine: function() {
    return this._eid(this.divId, this._enum.GUIDE_LINE);
  },

  /** Group ID for the icons.  */
  iconGroup: function() { return this._iconGroup; },

  /** ID for an icon . */
  icon: function(name) {
    return this._eid(this.divId, this._enum.ICON, name);
  },

  /** Group ID for the temporary icons. */
  tempIconGroup: function(name) {
    return this._eid(this.divId, this._enum.TEMP_ICON_CONTAINER, name);
  },

  /** ID for a temporary icon . */
  tempIcon: function(name) {
    return this._eid(this.divId, this._enum.TEMP_ICON, name);
  },

  /** ID for a temporary text. */
  tempIconText: function(name) {
    return this._eid(this.divId, this._enum.TEMP_TEXT, name);
  }
};
