(function() {
glift.displays.raphael.button = function(paper, robj, bbox) {
  if (bbox === undefined) {
    glift.util.logz(robj.getBBox());
    bbox = glift.displays.fromRaphaelBbox(robj.getBBox());
    glift.util.logz(bbox.toString());
  }
  return new Button(paper, bbox);
};

var Button = function(paper, bbox) {
  this.paper = paper;
  this.bbox = bbox;
  glift.util.logz('' + this.bbox.toString());
  this.rect = this.paper.rect(
      this.bbox.topLeft().x(),
      this.bbox.topLeft().y(),
      this.bbox.botRight().x(),
      this.bbox.botRight().y());
  this.rect.attr({fill: "red", opacity: 0.5});
  this.hoverin = undefined;
  this.hoverout = undefined;
  this.mousedown = undefined;
  this.mouseup = undefined;
};

Button.prototype = {
  setHover: function(hoverin, hoverout) {
    this.hoverin = hoverin;
    this.hoverout = hoverout;
    this.rect.hover(this.hoverin, this.hoverout);
  },

  setClick: function(mouseDown, mouseUp) {
    this.mouseDown = mouseDown;
    this.mouseUp = mouseUp;
    this.bbox.mousedown(this.mousedown);
    this.bbox.mouseup(this.mouseup);
  },

  destroy: function() {
    this.hoverin && this.rect.unhover(this.hoverin, this.hoverout);
    this.mousedown && this.rect.unmousedown(this.mousedown);
    this.mouseup && this.rect.unmouseup(this.mouseup);
    this.rect && this.rect.remove();
    this.hoverin = undefined;
    this.hoverout = undefined;
    this.mousedown = undefined;
    this.mouseup = undefined;
    this.rect = undefined;
  }
};

})();
