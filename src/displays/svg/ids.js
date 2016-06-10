goog.provide('glift.displays.svg.ids');
goog.provide('glift.displays.svg.IdGenerator');

/**
 * Collection of SVG ID utilities.
 */
glift.displays.svg.ids = {
  /**
   * Create an ID generator.
   * @param {string} divId
   * @return {!glift.displays.svg.IdGenerator}
   */
  gen: function(divId) {
    return new glift.displays.svg.IdGenerator(divId);
  },

  /**
   * Get an ID for a SVG element (return the stringForm id).
   *
   * @param {string} divId
   * @param {glift.displays.svg.Element} type
   * @param {(!glift.Point|!Object|string)=} opt_extraData
   * extraData may be undefined.  Usually a point, but also be an icon name.
   * @return {string} The relevant Id.
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
 * @param {string} divId
 * @constructor @final @struct
 */
glift.displays.svg.IdGenerator = function(divId) {
  /** @const {string}  */
  this.divId = divId;

  var eidFn = glift.displays.svg.ids.element;
  var svgEnum = glift.displays.svg.Element;

  /** @const @private {string} */
  this.svg_ = eidFn(this.divId, svgEnum.SVG);
  /** @const @private {string} */
  this.board_ = eidFn(this.divId, svgEnum.BOARD);
  /** @const @private {string} */
  this.boardCoordLabelGroup_ = eidFn(this.divId, svgEnum.BOARD_COORD_LABELS);
  /** @const @private {string} */
  this.stoneGroup_ = eidFn(this.divId, svgEnum.STONE_CONTAINER);
  /** @const @private {string} */
  this.stoneShadowGroup_ = eidFn(this.divId, svgEnum.STONE_SHADOW_CONTAINER);
  /** @const @private {string} */
  this.starpointGroup_ = eidFn(this.divId, svgEnum.STARPOINT_CONTAINER);
  /** @const @private {string} */
  this.buttonGroup_ = eidFn(this.divId, svgEnum.BUTTON_CONTAINER);
  /** @const @private {string} */
  this.boardButton_ = eidFn(this.divId, svgEnum.FULL_BOARD_BUTTON);
  /** @const @private {string} */
  this.lineGroup_ = eidFn(this.divId, svgEnum.BOARD_LINE_CONTAINER);
  /** @const @private {string} */
  this.markGroup_ = eidFn(this.divId, svgEnum.MARK_CONTAINER);
  /** @const @private {string} */
  this.iconGroup_ = eidFn(this.divId, svgEnum.ICON_CONTAINER);
  /** @const @private {string} */
  this.intersectionsGroup_ = eidFn(this.divId, svgEnum.INTERSECTIONS_CONTAINER);
  /** @const @private {string} */
  this.tempMarkGroup_ = eidFn(this.divId, svgEnum.TEMP_MARK_GROUP);
};

glift.displays.svg.IdGenerator.prototype = {
  /** @return {string} ID for the svg container. */
  svg: function() { return this.svg_; },

  /** @return {string} ID for the board. */
  board: function() { return this.board_; },

  /** @return {string} Group id for the board coordinate label group */
  boardCoordLabelGroup: function() { return this.boardCoordLabelGroup_; },

  /** @return {string} ID for the intersections group. */
  intersections: function() { return this.intersectionsGroup_; },

  /** @return {string} Group id for the stones. */
  stoneGroup: function() { return this.stoneGroup_; },

  /**
   * @param {!glift.Point} pt
   * @return {string}  Id for a stone.
   */
  stone: function(pt) {
    return glift.displays.svg.ids.element(
        this.divId, glift.displays.svg.Element.STONE, pt);
  },

  /** @return {string} Group id for the stone shadows. */
  stoneShadowGroup: function() { return this.stoneShadowGroup_; },

  /**
   * @param {!glift.Point} pt
   * @return {string}  Id for a stone shadow.
   */
  stoneShadow: function(pt) {
    return glift.displays.svg.ids.element(
        this.divId, glift.displays.svg.Element.STONE_SHADOW, pt);
  },

  /** @return {string} Group id for the star points. */
  starpointGroup: function() { return this.starpointGroup_; },

  /**
   * @param {!glift.Point} pt
   * @return {string} Id for a star point
   */
  starpoint: function(pt) {
    return glift.displays.svg.ids.element(
        this.divId, glift.displays.svg.Element.STARPOINT, pt);
  },

  /** @return {string} Group id for a button group. */
  buttonGroup: function() { return this.buttonGroup_; },

  /**
   * @param {!string} name Of the button.
   * @return {string} Id for the button.
   */
  button: function(name) {
    return glift.displays.svg.ids.element(
        this.divId, glift.displays.svg.Element.BUTTON, name);
  },

  /** @return {string} ID for a full-board button. */
  fullBoardButton: function() { return this.boardButton_; },

  /** @return {string} Group ID for the lines. */
  lineGroup: function() { return this.lineGroup_; },

  /**
   * @param {!glift.Point} pt
   * @return {string} Id for a board line.
   */
  line: function(pt) {
    return glift.displays.svg.ids.element(
        this.divId, glift.displays.svg.Element.BOARD_LINE, pt);
  },

  /** @return {string} Group id a Mark Container. */
  markGroup: function() { return this.markGroup_; },

  /**
   * @param {!glift.Point} pt
   * @return {string} ID for a mark.
   */
  mark: function(pt) {
    return glift.displays.svg.ids.element(
        this.divId, glift.displays.svg.Element.MARK, pt);
  },

  /** @return {string} Group id for temporary marks. */
  tempMarkGroup: function() {
    return this.tempMarkGroup_;
  },

  /** @return {string} ID for a guideline. */
  guideLine: function() {
    return glift.displays.svg.ids.element(
        this.divId, glift.displays.svg.Element.GUIDE_LINE);
  },

  /** @return {string} Group ID for the icons.  */
  iconGroup: function() { return this.iconGroup_; },

  /**
   * @param {string} name Of the icon.
   * @return {string} ID for an icon.
   */
  icon: function(name) {
    return glift.displays.svg.ids.element(
        this.divId, glift.displays.svg.Element.ICON, name);
  },

  /** @return {string} ID for the temp icon group. */
  tempIconGroup: function() {
    return glift.displays.svg.ids.element(
        this.divId, glift.displays.svg.Element.TEMP_ICON_CONTAINER);
  },

  /**
   * @param {string} name Of the icon.
   * @return {string} ID for the temp icon.
   */
  tempIcon: function(name) {
    return glift.displays.svg.ids.element(
        this.divId, glift.displays.svg.Element.TEMP_ICON, name);
  },

  /**
   * @param {string} name Of the icon.
   * @return {string} ID for the temp icon text.
   */
  tempIconText: function(name) {
    return glift.displays.svg.ids.element(
        this.divId, glift.displays.svg.Element.TEMP_TEXT, name);
  },
};
