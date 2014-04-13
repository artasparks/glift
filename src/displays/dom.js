glift.displays.dom = {
  elem: function(id) {
    var el = document.getElementById(id);
    if (el === null) { return null; }
    else { return new glift.displays.dom.Element(id, el); };
  },

  /** A plain old dom element. */
  Element: function(id, el) {
    this.id = id;
    this.el = el;
  }
};

glift.displays.dom.Element.prototype = {
  css: function(obj) {
    for (var key in obj) {
      this.el.style[key] = obj[key];
    }
    return this;
  },

  outerHeight: function() {
    // Danger!!  This method is currently (11 April 2014) very slow -- on the
    // order of 40 ms.  Avoid if possible
    return this.el.offsetHeight;
  },

  outerWidth: function() {
    // Danger!!  This method is currently (11 April 2014) very slow -- on the
    // order of 40 ms.  Avoid if possible
    return this.el.offsetWidth;
  },

  // TODO(kashomon): Sanitize
  html: function(text) {
    this.el.innerHTML = text;
  },

  remove: function() {
    this.el.parentElement.removeChild(this.el);
  }
};
