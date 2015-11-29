goog.provide('glift.displays.commentbox.CommentBox');

/**
 * Create a comment box with:
 *
 * @param {string} divId The div in which the comment box should live
 * @param {!glift.orientation.BoundingBox} posBbox The bounding box of the div
 *    (expensive to recompute)
 * @param {!glift.themes.base} theme The theme object.
 * @param {boolean} useMarkdown Whether or not to use markdown
 */
glift.displays.commentbox.create = function(
    divId, posBbox, theme, useMarkdown) {
  useMarkdown = useMarkdown || false;
  if (!theme) {
    throw new Error('Theme must be defined. was: ' + theme);
  }
  return new glift.displays.commentbox.CommentBox(
      divId, posBbox, theme, useMarkdown).draw();
};

/**
 * Comment box object.
 *
 * @package
 * @constructor
 */
glift.displays.commentbox.CommentBox = function(
    divId, positioningBbox, theme, useMarkdown) {
  this.divId = divId;
  this.bbox = glift.orientation.bbox.fromPts(
      glift.util.point(0,0),
      glift.util.point(positioningBbox.width(), positioningBbox.height()));
  this.theme = theme;
  this.useMarkdown = useMarkdown;
  this.el = undefined;
};

glift.displays.commentbox.CommentBox.prototype = {
  /** Draw the comment box */
  draw: function() {
    this.el = glift.dom.elem(this.divId);
    if (this.el === null) {
      throw new Error('Could not find element with ID ' + this.divId);
    }
    this.el.css(glift.obj.flatMerge({
      'overflow-y': 'auto',
      'MozBoxSizing': 'border-box',
      'boxSizing': 'border-box'
    }, this.theme.commentBox.css))
    // TODO(kashomon): Maybe add this in.
    // glift.dom.ux.onlyInnerVertScroll(this.el, this.bbox);
    this.el.addClass('glift-comment-box');
    return this;
  },

  /**
   * Set the text of the comment box. Note: this sanitizes the text to prevent
   * XSS and does some basic HTML-izing.
   * @param {string} text
   */
  setText: function(text) {
    this.el.empty();
    this.el.append(glift.dom.convertText(text, this.useMarkdown));
  },

  /** Clear the text from the comment box. */
  clearText: function() {
    this.el.empty();
  },

  /** Remove all the relevant comment box HTML. */
  destroy: function() {
    this.el.remove();
  }
};
