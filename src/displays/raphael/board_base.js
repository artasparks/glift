(function(){
otre.displays.raphael.Factory.prototype.createBoardBase = function() {
  var boardBase = new BoardBase(this.paper, this.environment, this.theme.board);
};

var BoardBase = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;
  // this.rect -- created with draw
};

BoardBase.prototype = {
  draw: function() {
    var box = this.environment.goBoardBox;
    this.destroy();
    this.rect = this.paper.rect(
        box.topLeft.x,
        box.topLeft.y,
        box.width,
        box.height);
    this.rect.attr({fill: this.subtheme.bgColor});
    return this;
  },

  redraw: function() {
    return this.draw();
  },

  destroy: function() {
    this.rect !== undefined && this.rect.remove();
    return this;
  }
};
})();
