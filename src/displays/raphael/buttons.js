(function() {
/**
 * Create a button from an object. 'data' will be passed as the argument to the
 * handlers.
 *
 * Warning! fromRaphaelBbox(...) is very slow, so avoid this method, if
 * possible by providing your own bbox.
 */
glift.displays.raphael.button = function(paper, data, robj, bbox) {
  if (bbox === undefined) {
    bbox = glift.displays.fromRaphaelBbox(robj.getBBox());
  }
  return new Button(paper, data, bbox);
};

var Button = function(paper, data, bbox) {
  this.paper = paper;
  this.data = data;
  this.bbox = bbox;
  this.rect = this.paper.rect(
      this.bbox.topLeft().x(),
      this.bbox.topLeft().y(),
      this.bbox.width(),
      this.bbox.height());
  this.rect.attr({fill: "red", opacity: 0.0});

  // handlers set by users of Button.
  this.mouseover = undefined;
  this.mouseout = undefined;
  this.mousedown = undefined;
  this.mouseup = undefined;
  this.click = undefined;

  var b = this; // closure variable.
  this.forceMouseOver = function() { b.mouseover && b.mouseover(b.data); };
  this.forceMouseOut = function() { b.mouseout && b.mouseout(b.data); };
  this.forceMouseDown = function() { b.mousedown && b.mousedown(b.data); };
  this.forceMouseUp = function() { b.mouseup && b.mouseup(b.data); };
  this.forceClick = function() { b.click && b.click(b.data); };

  this.rect.mouseover(this.forceMouseOver);
  this.rect.mouseout(this.forceMouseOut);
  this.rect.mousedown(this.forceMouseDown);
  this.rect.mouseup(this.forceMouseUp);
  this.rect.click(this.forceClick);
};

Button.prototype = {
  toFront: function() {
    this.rect && this.rect.toFront();
    return this;
  },

  cloneHandlers: function(that) {
    this.mouseover = that.mouseover;
    this.mouseout = that.mouseout;
    this.mousedown = that.mousedown;
    this.mouseup = that.mouseup;
    this.click = that.click;
  },

  setMouseOver: function(mouseover) {
    this.mouseover = mouseover;
    return this;
  },

  setMouseOut: function(mouseout) {
    this.mouseout = mouseout;
    return this;
  },

  setMouseDown: function(mousedown) {
    this.mousedown = mousedown;
    return this;
  },

  setMouseUp: function(mouseup) {
    this.mouseup = mouseup;
    return this;
  },

  setClick: function(click) {
    this.click = click;
    return this;
  },

  destroy: function() {
    // Handlers need to be specifically removed.
    this.rect.unmouseover(this.forceMouseOver);
    this.rect.unmouseout(this.forceMouseOut);
    this.rect.unmousedown(this.forceMouseDown);
    this.rect.unmouseup(this.forceMouseUp);
    this.rect.unclick(this.forceClick);

    this.rect && this.rect.remove();
    this.hoverin = undefined;
    this.hoverout = undefined;
    this.mousedown = undefined;
    this.mouseup = undefined;
    this.rect = undefined;
    return this;
  }
};

})();
