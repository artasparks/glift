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

glift.displays.svg.text = function(attrObj) {
  return new glift.displays.svg.SvgObj('text', attrObj);
};

glift.displays.svg.group = function() {
  return new glift.displays.svg.SvgObj('g');
};

glift.displays.svg.SvgObj = function(type, attrObj) {
  this._type = type;
  this._attrMap =  attrObj || {};
  this._children = [];
  this._idMap = {};
  this._text = '';
  this._data = undefined;
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
    base += '>' + this._text;
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
   * Set or get an SVG attribute.
   */
  attr: function(key, value) {
    if (value !== undefined) {
      this._attrMap[key] = value;
      return this;
    } else {
      return this._attrMap[key];
    }
  },

  /**
   * Set or get all the an SVG attributes.
   */
  attrObj: function(obj) {
    if (obj !== undefined && glift.util.typeOf(obj) === 'object') {
      this._attrMap = obj;
      return this;
    } else {
      return this._attrMap;
    }
  },

  /**
   * Set some internal data. Note: this data is not attached when the element is
   * generated.
   */
  data: function(data) {
    if (data !== undefined) {
      this._data = data;
      return this;
    } else {
      return this._data
    }
  },

  /**
   * Append some text. Ususally only for the 'text' element.
   */
  text: function(text) {
    if (text !== undefined) {
      this._text = "" + text
      return this;
    } else {
      return this._text;
    }
  },

  /**
   * Get child from an Id.
   */
  child: function(id) {
    return this._idMap[id];
  },

  /**
   * Get child from an Id.
   */
  rmChild: function(id) {
    delete this._idMap[id];
    return this;
  },

  /**
   * Get all the Children.
   */
  children: function() {
    return this._children;
  },

  /**
   * Empty out all the children.
   */
  emptyChildren: function() {
    this._children = [];
    return this;
  },

  /**
   * Add an already existing child.
   *
   * Returns the object
   */
  append: function(obj) {
    if (obj.attr('id') !== undefined) {
      this._idMap[obj.attr('id')] = obj;
    }
    this._children.push(obj);
    return this;
  },

  /**
   * Add a new svg object child.
   */
  appendNew: function(type, attrObj) {
    var obj = glift.displays.svg.createObj(type, attrObj);
    return this.append(obj);
  },

  copyNoChildren: function() {
    var newAttr = {};
    for (var key in this._attrMap) {
      newAttr[key] = this._attrMap[key];
    }
    return glift.displays.svg.createObj(this._type, newAttr);
  }
};
