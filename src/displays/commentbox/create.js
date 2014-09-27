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
    var cssObj = {
      'overflow-y': 'auto',
      'overflowY': 'auto',
      'MozBoxSizing': 'border-box',
      'boxSizing': 'border-box'
    };
    for (var key in this.theme.commentBox.css) {
      cssObj[key] = this.theme.commentBox.css[key]
    }
    this.el.css(cssObj);
    this.el.addClass('glift-comment-box');
    return this;
  },

  /** Sanitize the text in the comment box. */
  sanitize: function(text) {
    return glift.displays.commentbox.sanitize(text);
  },

  /**
   * Set the text of the comment box. Note: this sanitizes the text to prevent
   * XSS and does some basic HTML-izing.
   */
  setText: function(text) {
    text = this.sanitize(text);
    this.el.empty();
    var textSegments = text.split('\n');
    for (var i = 0; i < textSegments.length; i++) {
      var seg = textSegments[i];
      var pNode = glift.dom.elem(document.createElement('p'));
      pNode.css({
        margin: 0,
        padding: 0,
        'min-height': '1em'
      })
      pNode.html(seg);
      this.el.append(pNode);
    }
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
