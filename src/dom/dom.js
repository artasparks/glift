glift.dom = {
  /**
   * Construct a glift dom element. If arg is a string, assume an ID is being
   * passed in. If arg is an object and has nodeType and nodeType is 1
   * (ELEMENT_NODE), 
   */
  elem: function(arg) {
    var argtype = glift.util.typeOf(arg);
    if (argtype === 'string') {
      // Assume an element ID.
      var el = document.getElementById(arg);
      if (el === null) { return null; }
      else { return new glift.dom.Element(el, arg); };
    } else if (argtype === 'object' && arg.nodeType && arg.nodeType === 1) {
      // Assume an HTML node.
      // Note: nodeType of 1 => ELEMENT_NODE.
      return new glift.dom.Element(arg);
    }
    return null;
  },

  newDiv: function(id) {
    var elem = glift.dom.elem(document.createElement('div'));
    elem.attr('id', id);
    return elem;
  },

  /**
   * A simple wrapper for a plain old dom element. Note, id can be null if the
   * Element is constructed directly from elem.
   */
  Element: function(el, id) {
    this.el = el;
    this.id = id || null;
  }
};

glift.dom.Element.prototype = {
  /** Prepend an element, but only if it's a glift dom element. */
  prepend: function(that) {
    if (that.constructor === this.constructor) {
      // It's ok if firstChild is null;
      this.el.insertBefore(that.el, this.el.firstChild);
    }
    return this;
  },

  /** Append an element, but only if it's a glift dom element. */
  append: function(that) {
    if (that.constructor === this.constructor) {
      this.el.appendChild(that.el);
    }
    return this;
  },

  /** Set a text node under this element. */
  appendText: function(text) {
    if (text) {
      var newNode = this.el.ownerDocument.createTextNode(text);
      this.el.appendChild(newNode);
    }
    return this;
  },

  /**
   * Get or set an attribute on the HTML.
   */
  attr: function(key, value) {
    if (key == null) { return null; }

    var keyType = glift.util.typeOf(key);
    if (keyType === 'object') {
      var attrObj = key;
      for (var attrObjKey in attrObj) {
        var attrObjVal = attrObj[attrObjKey];
        this.el.setAttribute(attrObjKey, attrObjVal);
      }
    }

    if (keyType === 'string') {
      if (value == null) {
        return this.el.getAttribute(key);
      } else {
        this.el.setAttribute(key, value);
        if (key === 'id' && glift.util.typeOf(value) === 'string') {
          this.id = value;
        }
      }
    }
    return null;
  },

  /** Set the CSS with a CSS object */
  css: function(obj) {
    for (var key in obj) {
      this.el.style[key] = obj[key];
    }
    return this;
  },

  /** Get the CSS with a CSS object */

  /** Get the client height of the element */
  height: function() { return this.el.clientHeight; },

  /** Get the client width of the element */
  width: function() { return this.el.clientWidth; },

  /** Set an event on the element */
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
    this.el.parentElement && this.el.parentElement.removeChild(this.el);
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
