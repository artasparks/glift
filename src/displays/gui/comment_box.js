(function() {
glift.displays.gui.commentBox = function(divId, themeName) {
  return new CommentBox(divId, themeName).draw();
};

// TODO(kashomon): Pass in an options argument.
var CommentBox = function(
    divId, themeName) {
  this.divId = divId;
  this.themeName = themeName;
  this.theme = glift.themes.get(themeName);
  this.commentBoxObj = undefined; // JQuery obj
};

CommentBox.prototype = {
  draw: function() {
    // TODO(kashomon): Remove JQuery References
    this.commentBoxObj = $('#' + this.divId);
    var commentBoxHeight = $('#' + this.divId).height();
    var padding = 10; // TODO(kashomon): Put in theme
    var borderWidth = 1;
    var boardBorder = this.theme.board['stroke-width'];
    // var fontSize = width / 25 < 15 ? 15 : width / 25;
    var fontSize = 16;
    // commentBoxHeight * .13 < 14 ? 14 : commentBoxHeight * .13;
    // fontSize = fontSize > 16 ? 16 : fontSize;
    this.commentBoxObj.css({
      // TODO(kashomon): Get the theme info from the theme
      background: '#CCCCFF',
      border: borderWidth + 'px solid',
      margin: 'auto',
      'font-family': 'Baskerville',
      'overflow-y': 'auto',
      'font-size': fontSize,

      // prevent Chrome/web kit from resizing the text (font boosting)
      // ... which doesn't work for me, unfortunately.
      // '-webkit-text-size-adjust': 'none',
      // 'min-height': '1px',
      // 'max-height': '5000em',
      // 'max-height': '1000000px',

      // Prevent padding from affecting width
      '-webkit-box-sizing': 'border-box', /* Safari/Chrome, other WebKit */
      '-moz-box-sizing': 'border-box',    /* Firefox, other Gecko */
      'box-sizing': 'border-box',         /* Opera/IE 8+ */
      'padding': padding
    });
    return this;
  },

  setText: function(text) {
    this.commentBoxObj.html('<p>' +
        text.replace(/\n/g, '<br>') + '</p>');
  },

  clearText: function() {
    this.commentBoxObj.html('');
  },

  destroy: function() {
    this.commentBoxObj.empty();
  }
};

})();
