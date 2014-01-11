glift.displays.svg.createObj = function(type, attrObj) {
  return new glift.displays.svg.SvgObj(type, attrObj);
}

glift.displays.svg.svg = function(attrObj) {
  return new glift.displays.svg.SvgObj('svg', attrObj);
};

glift.displays.svg.circle = function(attrObj) {
  return new glift.displays.svg.SvgObj('circle', attrObj);
};

glift.displays.svg.path = function(attrObj) {
  return new glift.displays.svg.SvgObj('path', attrObj);
};

glift.displays.svg.rect = function(attrObj) {
  return new glift.displays.svg.SvgObj('rect', attrObj);
};

glift.displays.svg.image = function(attrObj) {
  return new glift.displays.svg.SvgObj('image', attrObj);
};

glift.displays.svg.group = function() {
  return new glift.displays.svg.SvgObj('g');
};

glift.displays.svg.SvgObj = function(type, attrObj) {
  this._type = type;
  this._attrMap =  attrObj || {};
  this._children = [];
};

glift.displays.svg.SvgObj.prototype = {
  /**
   * Append content onto a buffer.  This assumes the buffer has a push method,
   * and so at the very least, must be list-like.
   */
  flush: function(buffer) {
    buffer.push(this.render());
  },

  /**
   * Return the string form of the svg object.
   */
  render: function() {
    var base = '<' + this._type;
    for (var key in this._attrMap) {
      base += ' ' + key + '="' + this._attrMap[key] + '"';
    }
    base += '>';
    if (this._children.length > 0) {
      var baseBuffer = [base];
      for (var i = 0, ii = this._children.length; i < ii; i++) {
        baseBuffer.push(this._children[i].render());
      }
      baseBuffer.push('</' + this._type + '>');
      base = baseBuffer.join("\n");
    } else {
      base += '</' + this._type + '>';
    }
    return base;
  },

  /**
   * Set an SVG attribute.
   */
  attr: function(key, value) {
    this._attrMap[key] = value;
    return this;
  },

  /**
   * Add an already existing child.
   */
  addChild: function(obj) {
    this._children.push(obj);
    return this;
  },

  /**
   * Add a new svg object child.
   */
  addNewChild: function(type, attrObj) {
    this._children.push(glift.displays.svg.createObj(type, attrObj));
    return this;
  }
};
