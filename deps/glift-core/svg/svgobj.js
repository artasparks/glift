goog.provide('glift.svg.SvgObj');
goog.provide('glift.svg.ViewBox');

/**
 * @typedef {{
 *  tlX: number,
 *  tlY: number,
 *  brX: number,
 *  brY: number
 * }}
 */
glift.svg.ViewBox;


/**
 * Creats a SVG Wrapper object.
 *
 * @param {string} type Svg element type.
 * @param {!Object<string>=} opt_attrObj optional attribute object.
 */
glift.svg.createObj = function(type, opt_attrObj) {
   return new glift.svg.SvgObj(type, opt_attrObj);
};

/**
 * Creates a root SVG object.
 * @param {!Object<string>=} opt_attrObj optional attribute object.
 * @return {!glift.svg.SvgObj}
 */
glift.svg.svg = function(opt_attrObj) {
  return new glift.svg.SvgObj('svg', opt_attrObj)
      .setAttr('version', '1.1')
      .setAttr('xmlns', 'http://www.w3.org/2000/svg');
};

/**
 * Creates a circle svg object.
 * @param {!Object<string>=} opt_attrObj optional attribute object.
 * @return {!glift.svg.SvgObj}
 */
glift.svg.circle = function(opt_attrObj) {
  return new glift.svg.SvgObj('circle', opt_attrObj);
};

/**
 * Creates a path svg object.
 * @param {!Object<string>=} opt_attrObj optional attribute object.
 * @return {!glift.svg.SvgObj}
 */
glift.svg.path = function(opt_attrObj) {
  return new glift.svg.SvgObj('path', opt_attrObj);
};

/**
 * Creates an rectangle svg object.
 * @param {!Object<string>=} opt_attrObj optional attribute object.
 * @return {!glift.svg.SvgObj}
 */
glift.svg.rect = function(opt_attrObj) {
  return new glift.svg.SvgObj('rect', opt_attrObj);
};

/**
 * Creates an image svg object.
 * @param {!Object<string>=} opt_attrObj optional attribute object.
 * @return {!glift.svg.SvgObj}
 */
glift.svg.image = function(opt_attrObj) {
  return new glift.svg.SvgObj('image', opt_attrObj);
};

/**
 * Creates a text svg object.
 * @param {!Object<string>=} opt_attrObj optional attribute object.
 * @return {!glift.svg.SvgObj}
 */
glift.svg.text = function(opt_attrObj) {
  return new glift.svg.SvgObj('text', opt_attrObj);
};

/**
 * Create a group object (without any attributes)
 * @return {!glift.svg.SvgObj}
 */
glift.svg.group = function() {
  return new glift.svg.SvgObj('g');
};

/**
 * SVG Wrapper object.
 * @constructor @final @struct
 *
 * @param {string} type Svg element type.
 * @param {Object<string>=} opt_attrObj optional attribute object.
 */
glift.svg.SvgObj = function(type, opt_attrObj) {
  /** @private {string} */
  this.type_ = type;

  /**
   * Optional style tag. Should really only be on the top-level SVG element.
   * For more details, see:
   * https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style
   * @private {string}
   */
  this.style_ = '';

  /** @private {!Object<string>} */
  this.attrMap_ = opt_attrObj || {};
  /** @private {!Array<!glift.svg.SvgObj>} */
  this.children_ = [];
  /** @private {!Object<!glift.svg.SvgObj>} */
  this.idMap_ = {};
  /** @private {string} */
  this.text_ = '';
  /** @private {!glift.svg.ViewBox|undefined} */
  this.viewBox_ = undefined;
  /** @private {?Object} */
  this.data_ = null;
};

glift.svg.SvgObj.prototype = {
  /**
   * Return the string form of the svg object.
   * @return {string}
   */
  render: function() {
    var base = '<' + this.type_;
    for (var key in this.attrMap_) {
      base += ' ' + key + '="' + this.attrMap_[key] + '"';
    }
    if (this.viewBox_) {
      var vb = this.viewBox_;
      base += ' viewBox="' +
          vb.tlX + ' ' +
          vb.tlY + ' ' +
          vb.brX + ' ' +
          vb.brY + '"';
      if (!this.attrMap_['preserveAspectRatio']) {
        base += ' preserveAspectRatio="xMidYMid"'
      }
    }
    base += '>' + this.text_;
    if (this.style_) {
      base += '\n' +
        '<style type="text/css">\n' +
        '/* <![CDATA[ */\n' +
        this.style_ + '\n' +
        '/* ]]> */\n' +
        '</style>\n';
    }
    if (this.children_.length > 0) {
      base += '\n';
      for (var i = 0; i < this.children_.length; i++) {
        base += this.children_[i].render() + '\n';
      }
      base += '</' + this.type_ + '>';
    } else {
      base += '</' + this.type_ + '>';
    }
    return base;
  },

  /** @return {string} A value in the attribute map. */
  attr: function(key) {
    return this.attrMap_[key];
  },

  /**
   * Sets an SVG attribute.
   * @param {string} key The key of an object in the map.
   * @param {string|number} value The value to set in the map.
   * @return {!glift.svg.SvgObj} This object.
   */
  setAttr: function(key, value) {
    this.attrMap_[key] = value + '';
    return this;
  },

  /**
   * Sets the top-level CSS-styling.
   * @param {string} s
   * @return {!glift.svg.SvgObj} This object.
   */
  setStyle: function(s) {
    this.style_ = s;
    return this;
  },

  /**
   * Sets the view-box for the SVG element. 
   * https://css-tricks.com/scale-svg/
   *
   * @param {number} tlX tl.y
   * @param {number} tlY tl.x
   * @param {number} brX br.y
   * @param {number} brY br.x
   * @return {!glift.svg.SvgObj} this
   */
  setViewBox: function(tlX, tlY, brX, brY) {
    this.viewBox_ = {
      tlX: tlX,
      tlY: tlY,
      brX: brX,
      brY: brY,
    };
    return this;
  },

  /** @return {?string} the Id of this object or null. */
  id: function() {
    return /** @type {?string} */ (this.attrMap_['id'] || null);
  },

  /**
   * Convenience method to avoid null ID type.
   * @return {string}
   */
  idOrThrow: function() {
    if (this.id() == null) {
      throw new Error('ID was null; expected to be non-null');
    }
    return /** @type {string} */ (this.id());
  },

  /**
   * Sets the ID (using the Attribute object as a store).
   * @param {string} id
   * @return {!glift.svg.SvgObj} This object.
   */
  setId: function(id) {
    if (id) {
      this.attrMap_['id'] = id;
    }
    return this;
  },

  /** @return {!Object<string>} The attribute object.  */
  attrObj: function() {
    return this.attrMap_;
  },

  /**
   * Sets the entire attribute object.
   * @param {!Object<string>} attrObj
   * @return {!glift.svg.SvgObj} This object.
   */
  setAttrObj: function(attrObj) {
    if (glift.util.typeOf(attrObj) !== 'object') {
      throw new Error('Attr obj must be of type object');
    }
    this.attrMap_ = attrObj;
    return this;
  },

  /** @return {?Object} The node's data */
  data: function() {
    return this.data_
  },

  /**
   * Set some internal data. Note: this data is not attached when the element is
   * generated.
   * @param {!Object} data
   * @return {!glift.svg.SvgObj} This object.
   */
  setData: function(data) {
    this.data_ = data;
    return this;
  },

  /** @return {string} The text on the node. */
  text: function() {
    return this.text_;
  },

  /**
   * Append some text. Usually only for text elements.
   * @param {string} text
   * @return {!glift.svg.SvgObj} This object.
   */
  setText: function(text) {
    this.text_ = text;
    return this;
  },

  /** @return {string} The type of this object. */
  type: function() {
    return this.type_;
  },

  /**
   * Get child from an Id.
   * @return {!glift.svg.SvgObj} The child obj.
   */
  child: function(id) {
    return this.idMap_[id];
  },

  /**
   * Remove child, based on id.
   * @return {!glift.svg.SvgObj} This object.
   */
  rmChild: function(id) {
    delete this.idMap_[id];
    return this;
  },

  /**
   * Get all the Children.
   * @return {!Array<!glift.svg.SvgObj>}
   */
  children: function() {
    return this.children_;
  },

  /**
   * Empty out all the children.
   * @return {!glift.svg.SvgObj} this object.
   */
  emptyChildren: function() {
    this.children_ = [];
    return this;
  },

  /**
   * Add an already existing child.
   * @param {!glift.svg.SvgObj} obj Object to add.
   * @return {!glift.svg.SvgObj} This object.
   */
  append: function(obj) {
    if (obj.id() !== undefined) {
      this.idMap_[obj.id()] = obj;
    }
    this.children_.push(obj);
    return this;
  },

  /**
   * Add a new svg object child.
   * @param {string} type
   * @param {!Object<string>} attrObj
   * @return {!glift.svg.SvgObj} This object.
   */
  appendNew: function(type, attrObj) {
    var obj = glift.svg.createObj(type, attrObj);
    return this.append(obj);
  },

  /**
   * Create a copy of the object without any children
   * @return {!glift.svg.SvgObj} The new object.
   */
  copyNoChildren: function() {
    var newAttr = {};
    for (var key in this.attrMap_) {
      newAttr[key] = this.attrMap_[key];
    }
    return glift.svg.createObj(this.type_, newAttr);
  }
};
