/**
 * Collection of ID utilities, mostly for SVG.
 */
glift.displays.ids = {
  /**
   * Create an ID generator.
   */
  generator: function(divId) {
    return new glift.displays.ids._Generator(divId);
  },

  /**
   * Get an ID for a SVG element (return the stringForm id).
   *
   * extraData may be undefined.  Usually a point, but also be an icon name.
   */
  element: function(divId, type, extraData) {
    var base = divId + "_" + type;
    if (extraData !== undefined) {
      if (extraData.x !== undefined) {
        return base + '_' + extraData.x() + "_" + extraData.y();
      } else {
        return base + '_' + extraData.toString();
      }
    } else {
      return base;
    }
  },

  _Generator: function(divId) {
    this.divId = divId;
    this._eid = glift.displays.ids.element;
    this._enum = glift.enums.svgElements;

    this._svg = this._eid(this.divId, this._enum.SVG);
    this._board = this._eid(this.divId, this._enum.BOARD);
    this._stoneGroup = this._eid(this.divId, this._enum.STONE_CONTAINER);
    this._stoneShadowGroup =
        this._eid(this.divId, this._enum.STONE_SHADOW_CONTAINER);
    this._starpointGroup = this._eid(this.divId, this._enum.STARPOINT_CONTAINER);
    this._buttonGroup = this._eid(this.divId, this._enum.BUTTON_CONTAINER);
    this._lineGroup = this._eid(this.divId, this._enum.BOARD_LINE_CONTAINER);
    this._markGroup = this._eid(this.divId, this._enum.MARK_CONTAINER);
    this._iconGroup = this._eid(this.divId, this._enum.ICON_CONTAINER);
  }
};

glift.displays.ids._Generator.prototype = {
  /** ID for the svg container. */
  svg: function() { return this._svg; },

  /** ID for the board. */
  board: function() { return this._board; },

  /** Group id for the stones. */
  stoneGroup: function() { return this._stoneGroup; },

  /** Id for a stone. */
  stone: function(pt) {
    return this._eid(this.divId, this._enum.STONE, pt);
  },

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
  button: function(pt) {
    return this._eid(this.divId, this._enum.BUTTON, pt);
  },

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
