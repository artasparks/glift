(function() {
glift.displays.gui.commentBox = function(
    divId, displayWidth, boundingWidth, themeName, useBoardImage) {
  return new CommentBox(divId, displayWidth, boundingWidth, themeName,
      useBoardImage).draw();
};

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
    // TODO(kashomon): Remove JQuery References for purity.
    this.commentBoxObj = $('#' + this.divId);
    var commentBoxHeight = $('#' + this.divId).height();
    var padding = 10; // TODO(kashomon): Make 'static' variable.
    var borderWidth = 1;
    var boardBorder = this.theme.board['stroke-width'];

    // This apparently needs to be accounted for separately.
    // TODO(kashomon): Get this from the theme.
    var extra = padding + borderWidth;
    this.commentBoxObj.css({
      // TODO(kashomon): Get the theme info from the theme
      background: '#CCCCFF',
      border: borderWidth + 'px solid',
      left: (this.boundingWidth - this.displayWidth) / 2 - boardBorder,
      //right: (boundingWidth + this.display.width()), //- 2 * padding,
      width: this.displayWidth - (extra * 2) + 1 * boardBorder,
      height: commentBoxHeight - (extra * 2),
      margin: 'auto',
      'font-family': 'Baskerville',
      overflow: 'auto',
      'font-size': 'large',
      padding: padding
    });
    return this;
  },

  setText: function(text) {
    this.commentBoxObj.html('<p>' +
        text.replace(/\n/g, '<br><p>'));
  },

  clearText: function() {
    this.commentBoxObj.html('');
  },

  destroy: function() {
    this.commentBoxObj.empty();
  }
};

})();
