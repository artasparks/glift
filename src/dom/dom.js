goog.provide('glift.dom');
goog.provide('glift.dom.Element');

// TODO(kashomon): glift.dom is not an ideal abstraction. Ideally, this would be
// a series of helper classes rather than a full on element wrapper. There are
// several warts here that make this difficult to deal with -- like the
// implicit assumption that all elements have element IDs.
glift.dom = {
  /**
   * Constructs a glift dom element. If arg is a string, assume an ID is being
   * passed in. If arg is an object and has nodeType and nodeType is 1
   * (ELEMENT_NODE), just wrap the element.
   *
   * @param {string|!Element} arg
   * @return {glift.dom.Element} A wrapped DOM element. Can be null if the ID
   *    cannot be found or the arg type is not a string or Element.
   */
  elem: function(arg) {
    var argtype = glift.util.typeOf(arg);
    if (argtype === 'string') {
      // Assume an element ID.
      arg = /** @type {string} */ (arg);
      var el = document.getElementById(arg);
      if (el === null) {
        return null;
      } else {
        return new glift.dom.Element(/* @type {!Element} */ (el), arg);
      };
    } else if (argtype === 'object' && arg.nodeType && arg.nodeType === 1) {
      // Assume an HTML node.
      // Note: nodeType of 1 => ELEMENT_NODE.
      return new glift.dom.Element(/** @type {!Element} */ (arg));
    }
    return null;
  },

  /**
   * Creates a new div dom element with the relevant id.
   * @param {string} id
   * @return {!glift.dom.Element}
   */
  newDiv: function(id) {
    var elem = glift.dom.elem(document.createElement('div'));
    elem.setAttr('id', id);
    return elem;
  },

  /**
   * Convert some text to some dom elements.
   * @param {string} text The input raw text
   * @param {boolean} useMarkdown Whether or not to render with markdown.
   * @param {!Object=} opt_css Optional CSS object to apply to the lines.
   * @return {!glift.dom.Element}
   */
  convertText: function(text, useMarkdown, opt_css) {
    text = glift.dom.sanitize(text);
    if (useMarkdown) {
      text = glift.markdown.render(text);
    }
    var wrapper = glift.dom.newElem('div');
    wrapper.setAttr('class', glift.themes.classes.TEXT_BOX);

    if (useMarkdown) {
      wrapper.html(text);
    } else {
      var textSegments = text.split('\n');
      for (var i = 0; i < textSegments.length; i++) {
        var seg = textSegments[i];
        var baseCss = { margin: 0, padding: 0, 'min-height': '1em' };
        if (opt_css) {
          for (var key in opt_css) {
            baseCss[key] = opt_css[key];
          }
        }
        var pNode = glift.dom.newElem('p').css(baseCss);
        pNode.html(seg);
        wrapper.append(pNode);
      }
    }
    return wrapper;
  },

  /**
   * Produces an absolutely positioned div from a bounding box.
   * @return {!glift.dom.Element} A new absolutely positioned div.
   */
  absBboxDiv: function(bbox, id) {
    var newDiv  = glift.dom.newDiv(id);
    var cssObj = {
      position: 'absolute',
      margin: '0px',
      padding: '0px',
      top: bbox.top() + 'px',
      left: bbox.left() + 'px',
      width: bbox.width() + 'px',
      height: bbox.height() + 'px',
      MozBoxSizing: 'border-box',
      boxSizing: 'border-box'
    };
    newDiv.css(cssObj);
    return newDiv;
  },

  /**
   * Convert a string allow user to specify a type of Element.
   *
   * @param {string} type The type of element to create.
   * @return {glift.dom.Element}
   */
  newElem: function(type) {
    if (!type || glift.util.typeOf(type) !== 'string') {
      throw new Error('Type must be a string. was: [' + type + ']');
    }
    return glift.dom.elem(document.createElement(type));
  }
};

/**
 * A simple wrapper for a plain old dom element. Note, id can be null if the
 * Element is constructed directly from elem.
 *
 * @param {!Element} el A DOM Element.
 * @param {string=} opt_id Optional ID -- defaults to null.
 *
 * @constructor @final @struct
 */
glift.dom.Element = function(el, opt_id) {
  /** @type {!Element} */
  this.el = el;
  /** @type {?string} */
  this.id = opt_id || null;
}

glift.dom.Element.prototype = {
  /**
   * Prepends an element, but only if it's a glift dom element.
   * @param {!glift.dom.Element|!Element} that
   */
  prepend: function(that) {
    var possibleElem = /** @type {!Element} */ (that);
    if (possibleElem && possibleElem.nodeType) {
      this.el.appendChild(possibleElem);
    } else if (that && that.el) {
      var thar = /** @type {!glift.dom.Element} */ (that);
      // It's ok if firstChild is null;
      this.el.insertBefore(thar.el, this.el.firstChild);
    } else {
      throw new Error('Could not append unknown element: ' + that);
    }
    return this;
  },

  /**
   * Appends an element, but only if it's a glift dom element.
   * @param {!glift.dom.Element|!Element} that
   */
  append: function(that) {
    var possibleElem = /** @type {!Element} */ (that);
    if (possibleElem && possibleElem.nodeType) {
      this.el.appendChild(possibleElem);
    } else if (that && that.el) {
      var thar = /** @type {!glift.dom.Element} */ (that);
      this.el.appendChild(thar.el);
    } else {
      throw new Error('Could not append unknown element: ' + that);
    }
    return this;
  },

  /**
   * Sets a text node under this element.
   * @param {string} text
   */
  appendText: function(text) {
    if (text) {
      var newNode = this.el.ownerDocument.createTextNode(text);
      this.el.appendChild(newNode);
    }
    return this;
  },

  /**
   * Set an attribute on the element. If the key is an ID and the value is a
   * string, also set the ID field.
   *
   * @param {string} key
   * @param {boolean|number|string} value
   * @return {!glift.dom.Element}
   */
  setAttr: function(key, value) {
    this.el.setAttribute(key, value);
    if (key === 'id' && glift.util.typeOf(value) === 'string') {
      // Also set the ID field if the key is 'id'.
      this.id = /** @type {string} */ (value);
    }
    return this;
  },

  /** @return {*} The attribute value */
  attr: function(key) {
    return this.el.getAttribute(key);
  },

  /**
   * Set several attributes using an attribute object.
   * @param {!Object} attrObj A object with multiple attributes.
   */
  setAttrObj: function(attrObj) {
    for (var attrObjKey in attrObj) {
      var attrObjVal = attrObj[attrObjKey];
      this.el.setAttribute(attrObjKey, attrObjVal);
    }
  },

  /**
   * Gets all the attributes of the element, but as an object.
   * @return {!Object} Attribute object.
   */
  attrs: function() {
    var out = {};
    for (var i = 0; i < this.el.attributes.length; i++) {
      var att = this.el.attributes[i];
      out[att.nodeName] = att.value;
    }
    return out;
  },

  /**
   * Sets the CSS with a CSS object. Note this converts foo-bar to fooBar.
   * @param {!Object} obj Attribute obj
   */
  // TODO(kashomon): This should probably be called style.
  css: function(obj) {
    for (var key in obj) {
      var outKey = key.replace(/-(.)?/g, function(match, group1) {
        return group1 ? group1.toUpperCase() : '';
      });
      this.el.style[outKey] = obj[key];
    }
    return this;
  },

  /**
   * Add a CSS class.
   * @param {string} className
   */
  addClass: function(className) {
    if (!this.el.className) {
      this.el.className = className;
    } else {
      this.el.className += ' ' + className;
    }
    return this;
  },

  /**
   * Remove a CSS class.
   * @param {string} className
   */
  removeClass: function(className) {
    this.el.className = this.el.className.replace(
        new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'g'), '');
  },

  /**
   * Get the client height of the element
   * @return {number}
   */
  height: function() { return this.el.clientHeight; },

  /**
   * Get the client width of the element
   * @return {number}
   */
  width: function() { return this.el.clientWidth; },

  /**
   * Set an event on the element
   * @param {string} eventName}
   * @param {function(!Event)} func
   */
  on: function(eventName, func) {
    func.bind(this);
    this.el.addEventListener(eventName, func);
  },

  /** Set the inner HTML. Rather dangerous -- should be used with caution. */
  html: function(inhtml) {
    if (inhtml !== undefined) {
      this.el.innerHTML = inhtml;
    } else {
      return this.el.innerHTML;
    }
  },

  /** Remove the current element from the dom. */
  remove: function() {
    var parent = this.el.parentNode;
    if (parent) parent.removeChild(this.el);
  },

  /** Empty out the children. */
  empty: function() {
    var node = this.el;
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  },

  /**
   * Get the current coordinates of the first element, or set the coordinates of
   * every element, in the set of matched elements, relative to the document.
   * Calculates a top and left. Largely taken from jQuery. 
   */
  offset: function() {
    var box = {top: 0, left: 0};
    var doc = this.el && this.el.ownerDocument;
    var docElem = doc.documentElement;
    var win = doc.defaultView;
    // If we don't have gBCR, just use 0,0 rather than error
    if (glift.util.typeOf(this.el.getBoundingClientRect) !== 'undefined') {
      box = this.el.getBoundingClientRect();
    }
    return {
      top: box.top + win.pageYOffset - docElem.clientTop,
      left: box.left + win.pageXOffset - docElem.clientLeft
    };
  },

  /** Gets the boundingClientRect */
  boundingClientRect: function() {
    return this.el.getBoundingClientRect();
  }
};
