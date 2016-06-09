goog.provide('glift.displays.commentbox.CommentBox');

/**
 * Create a comment box with:
 *
 * @param {string} divId The div in which the comment box should live
 * @param {!glift.orientation.BoundingBox} posBbox The bounding box of the div
 *    (expensive to recompute)
 * @param {!glift.themes.base} theme The theme object.
 * @param {boolean} useMarkdown Whether or not to use markdown
 *
 * @return {!glift.displays.commentbox.CommentBox}
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
 * @package @constructor @struct @final
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
    this.el.css(glift.util.obj.flatMerge({
      'overflow-y': 'auto',
      'MozBoxSizing': 'border-box',
      'boxSizing': 'border-box'
    }, this.theme.commentBox.css))
    this.el.addClass('glift-comment-box');
    this.scrollFix();
    return this;
  },

  /**
   * Fix the scrolling when user gets to the bottom of a div, so that the user
   * doesn't scroll off into no mans land.
   */
  scrollFix: function() {
    var elem = document.getElementById(this.divId);
    if ('onwheel' in elem) {
      elem.addEventListener('wheel', function(e) {
        var deltaY = e.deltaY;
        var pixelsPerTick = 30;
        // Manually move the scroll box
        this.scrollTop += deltaY * pixelsPerTick;
        e.preventDefault();
      });
    }
  },

  /**
   * Set the text of the comment box. Note: this sanitizes the text to prevent
   * XSS and does some basic HTML-izing.
   * @param {string} text
   * @param {string=} opt_collisionsLabel
   */
  setText: function(text, opt_collisionsLabel) {
    this.el.empty();
    var collisionsLabel = opt_collisionsLabel || '';
    if (collisionsLabel) {
      collisionsLabel = glift.dom.sanitize(collisionsLabel);
      var em = glift.dom.newElem('em')
          .append(glift.dom.convertText(collisionsLabel, false));
      this.el.append(em);
    }
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
