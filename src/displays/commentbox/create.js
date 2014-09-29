/**
 * Create a comment box with:
 *
 * divId: The div in which the comment box should live
 * posBbox: The bounding box of the div (expensive to recompute)
 * theme: The theme object.
 */
glift.displays.commentbox.create = function(divId, posBbox, theme) {
  if (!theme) {
    throw new Error('Theme must be defined. was: ' + theme);
  }
  return new glift.displays.commentbox._CommentBox(divId, posBbox, theme).draw();
};

glift.displays.commentbox._CommentBox = function(divId, positioningBbox, theme) {
  this.divId = divId;
  this.bbox = glift.displays.bbox.fromPts(
      glift.util.point(0,0),
      glift.util.point(positioningBbox.width(), positioningBbox.height()));
  this.theme = theme;
  this.el = undefined;
};

glift.displays.commentbox._CommentBox.prototype = {
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
    glift.dom.ux.onlyInnerVertScroll(this.el, this.bbox);
    this.el.addClass('glift-comment-box');
    return this;
  },

  /**
   * Set the text of the comment box. Note: this sanitizes the text to prevent
   * XSS and does some basic HTML-izing.
   */
  setText: function(text) {
    this.el.empty();
    this.el.append(glift.dom.convertText(text));
  },

  /** Clear the text from the comment box. */
  clearText: function() {
    this.el.empty();
  },

  /** Remove all the relevant comment box HTML. */
  destroy: function() {
    this.commentBoxObj.empty();
  }
};
