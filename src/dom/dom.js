glift.dom = {
  /**
   * Constructs a glift dom element. If arg is a string, assume an ID is being
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

  /** Creates a new div dom element with the relevant id. */
  newDiv: function(id) {
    var elem = glift.dom.elem(document.createElement('div'));
    elem.attr('id', id);
    return elem;
  },

  /**
   * Convert some text to some dom elements.
   * text: The input raw text
   * optCss: optional CSS object to apply to the lines.
   */
  convertText: function(text, useMarkdown, optCss) {
    text = glift.dom.sanitize(text);
    if (useMarkdown) {
      text = glift.markdown.render(text);
    }
    var wrapper = glift.dom.newElem('div');
    wrapper.attr('class', glift.dom.classes.commentBox);

    if (useMarkdown) {
      wrapper.html(text);
    } else {
      var textSegments = text.split('\n');
      for (var i = 0; i < textSegments.length; i++) {
        var seg = textSegments[i];
        var baseCss = { margin: 0, padding: 0, 'min-height': '1em' };
        if (optCss) {
          for (var key in optCss) {
            baseCss[key] = optCss[key];
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
   */
  absBboxDiv: function(bbox, id) {
    var newDiv  = this.newDiv(id);
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

  /** Convert a string. */
  newElem: function(type) {
    return type ? glift.dom.elem(document.createElement(type + '')) : null;
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
  /** Prepends an element, but only if it's a glift dom element. */
  prepend: function(that) {
    if (that.constructor === this.constructor) {
      // It's ok if firstChild is null;
      this.el.insertBefore(that.el, this.el.firstChild);
    } else {
      throw new Error('Could not append unknown element: ' + that);
    }
    return this;
  },

  /** Appends an element, but only if it's a glift dom element. */
  append: function(that) {
    if (that.constructor === this.constructor) {
      this.el.appendChild(that.el);
    } else {
      throw new Error('Could not append unknown element: ' + that);
    }
    return this;
  },

  /** Sets a text node under this element. */
  appendText: function(text) {
    if (text) {
      var newNode = this.el.ownerDocument.createTextNode(text);
      this.el.appendChild(newNode);
    }
    return this;
  },

  /**
   * Gets or set an attribute on the HTML, JQuery Style.
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

  /** Gets all the attributes of the element, but as an object. */
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
   */
  css: function(obj) {
    for (var key in obj) {
      var outKey = key.replace(/-(.)?/g, function(match, group1) {
        return group1 ? group1.toUpperCase() : '';
      });
      this.el.style[outKey] = obj[key];
    }
    return this;
  },

  /** Add a CSS class. */
  addClass: function(className) {
    if (!this.el.className) {
      this.el.className = className;
    } else {
      this.el.className += ' ' + className;
    }
    return this;
  },

  /** Remove a CSS class. */
  removeClass: function(className) {
    this.el.className = this.el.className.replace(
        new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'g'), '');
  },

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
