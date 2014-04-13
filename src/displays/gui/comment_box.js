(function() {
// TODO(kashomon): Move to its own directory.
glift.displays.gui.commentBox = function(divId, themeName, bbox) {
  return new CommentBox(divId, themeName, bbox).draw();
};

// TODO(kashomon): Pass in an options argument.
var CommentBox = function(divId, themeName, bbox) {
  this.divId = divId;
  this.themeName = themeName;
  this.bbox = bbox;
  this.theme = glift.themes.get(themeName);
  this.el = undefined;
};

CommentBox.prototype = {
  draw: function() {
    this.el = glift.displays.dom.elem(this.divId);
    if (this.el === null) {
      throw new Error("Could not find element with ID " + this.divId);
    }
    var commentBoxHeight = this.bbox.height;
    var padding = 10; // TODO(kashomon): Put in theme
    var borderWidth = 1;
    var boardBorder = this.theme.board['stroke-width'];
    var fontSize = 16;
    this.el.css({
      background: '#CCF',
      border: borderWidth + 'px solid',
      margin: 'auto',
      'font-family': 'Baskerville',
      'overflow-y': 'auto',
      'font-size': fontSize,
      '-webkit-box-sizing': 'border-box', /* Safari/Chrome, other WebKit */
      '-moz-box-sizing': 'border-box',    /* Firefox, other Gecko */
      'box-sizing': 'border-box',         /* Opera/IE 8+ */
      'padding': padding
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
