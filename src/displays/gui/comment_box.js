(function() {
glift.displays.gui.commentBox = function(
    divId, displayWidth, boundingWidth, themeName, useBoardImage) {
  return new CommentBox(divId, displayWidth, boundingWidth, themeName,
      useBoardImage).draw();
};

// TODO(kashomon): Pass in an options argument.
var CommentBox = function(
    divId, displayWidth, boundingWidth, themeName, useBoardImage) {
  this.divId = divId;
  this.displayWidth = displayWidth;
  this.boundingWidth = boundingWidth;
  this.themeName = themeName;
  this.theme = glift.themes.get(themeName);
  this.useBoardImage = useBoardImage;
  this.commentBoxObj = undefined; // currently: jquery obj
};

CommentBox.prototype = {
  draw: function() {
    // TODO(kashomon): Remove JQuery References
    this.commentBoxObj = $('#' + this.divId);
    var commentBoxHeight = $('#' + this.divId).height();
    var padding = 10; // TODO(kashomon): Put in theme
    var borderWidth = 1;
    var boardBorder = this.theme.board['stroke-width'];
    var width = this.displayWidth;
    // var fontSize = width / 25 < 15 ? 15 : width / 25;
    var fontSize = commentBoxHeight * .13 < 15 ? 15 : commentBoxHeight * .13;
    this.commentBoxObj.css({
      // TODO(kashomon): Get the theme info from the theme
      background: '#CCCCFF',
      border: borderWidth + 'px solid',
      left: Math.ceil((this.boundingWidth - this.displayWidth) / 2 - boardBorder),
      width: Math.ceil(this.displayWidth + boardBorder),
      height: commentBoxHeight,
      margin: 'auto',
      'font-family': 'Baskerville',
      overflow: 'auto',
      'font-size': fontSize,
      // Prevent padding from affecting width
      '-webkit-box-sizing': 'border-box', /* Safari/Chrome, other WebKit */
      '-moz-box-sizing': 'border-box',    /* Firefox, other Gecko */
      'box-sizing': 'border-box',         /* Opera/IE 8+ */
      padding: padding
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
