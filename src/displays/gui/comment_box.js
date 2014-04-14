(function() {
// TODO(kashomon): Move to its own directory.
glift.displays.gui.commentBox = function(divId, themeName, posBbox) {
  return new CommentBox(divId, themeName, posBbox).draw();
};

// TODO(kashomon): Pass in an options argument.
var CommentBox = function(divId, themeName, positioningBbox) {
  this.divId = divId;
  this.themeName = themeName;
  this.bbox = glift.displays.bboxFromPts(
      glift.util.point(0,0),
      glift.util.point(positioningBbox.width(), positioningBbox.height()));
  this.theme = glift.themes.get(themeName);
  this.el = undefined;
};

CommentBox.prototype = {
  draw: function() {
    this.el = glift.displays.dom.elem(this.divId);
    if (this.el === null) {
      throw new Error("Could not find element with ID " + this.divId);
    }
    var padding = 10; // TODO(kashomon): Put in theme
    var borderWidth = 1;
    var boardBorder = this.theme.board['stroke-width'];
    var fontSize = 16;
    this.el.css({
      background: '#CCF',
      border: borderWidth + 'px solid',
      'font-family': 'Baskerville',
      'font-size': fontSize + 'px',
      'overflow-y': 'auto',
      'overflowY': 'auto',
      'MozBoxSizing': 'border-box',
      'box-sizing': 'border-box',
      'padding': padding + 'px'
    });
    return this;
  },

  setText: function(text) {
    this.el.html('<p>' + text.replace(/\n/g, '<br>') + '</p>');
  },

  clearText: function() {
    this.el.html('');
  },

  destroy: function() {
    this.commentBoxObj.empty();
  }
};
})();
