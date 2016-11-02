goog.provide('glift.displays.svg.dom');

/** Dom methods for manipulating SVG. */
glift.displays.svg.dom = {
  /**
   * Attach content to a div.
   * @param {!glift.svg.SvgObj} svgObj
   * @param {string} divId
   */
  attachToParent: function(svgObj, divId) {
    var svgContainer = document.getElementById(divId);
    if (svgContainer) {
      glift.displays.svg.dom.attachToElem_(svgObj, svgContainer);
    }
  },

  /**
   * Attach content to an already defined element.
   * @param {!glift.svg.SvgObj} svgObj
   * @param {!Element|!glift.dom.Element} elem
   * @private
   */
  attachToElem_: function(svgObj, elem) {
    var possibleElem = /** @type {!Element} */ (elem);
    if (possibleElem && possibleElem.nodeType) {
      possibleElem.appendChild(
          glift.displays.svg.dom.asElement(svgObj));
    } else {
      var domEl = /** @type {!glift.dom.Element} */ (elem);
      domEl.el.appendChild(
          glift.displays.svg.dom.asElement(svgObj));
    }
  },

  /**
   * Append an SVG element and attach to the DOM.
   * @param {!glift.svg.SvgObj} svgObj
   * @param {!glift.svg.SvgObj} obj
   */
  appendAndAttach: function(svgObj, obj) {
    svgObj.append(obj);
    if (svgObj.id()) {
      glift.displays.svg.dom.attachToParent(obj, svgObj.idOrThrow());
    }
  },

  // TODO(kashomon): Currently unused. Remove?
  /**
   * Remove from the element from the DOM.
   * @param {!glift.svg.SvgObj} obj
   */
  removeFromDom: function(obj) {
    if (obj.id()) {
      var elem = document.getElementById(obj.idOrThrow());
      if (elem) { elem.parentNode.removeChild(elem); }
    }
  },

  /**
   * Turn the obj node (and all children nodes) into SVG elements.
   * @param {!glift.svg.SvgObj} o
   * @return {!Element} The elment
   */
  asElement: function(o) {
    var elem = document.createElementNS(
        "http://www.w3.org/2000/svg", o.type());
    for (var attr in o.attrObj()) {
      if (attr === 'xlink:href') {
        elem.setAttributeNS(
            'http://www.w3.org/1999/xlink', 'href', o.attr(attr));
      } else {
        elem.setAttribute(attr, o.attr(attr));
      }
    }
    if (o.type() === 'text') {
      var textNode = document.createTextNode(o.text());
      elem.appendChild(textNode);
    }
    for (var i = 0; i < o.children().length; i++) {
      elem.appendChild(glift.displays.svg.dom.asElement(o.children()[i]));
    }
    return elem;
  },

  /**
   * Update a particular attribute in the DOM with at attribute that exists on
   * this element.
   * @param {!glift.svg.SvgObj} obj
   * @param {string} attrName
   */
  updateAttrInDom: function(obj, attrName) {
    var id = obj.id();
    if (id) {
      var elem = document.getElementById(id)
      if (elem && attrName && obj.attr(attrName)) {
        var value = /** @type (boolean|number|string) */ (obj.attr(attrName));
        elem.setAttribute(attrName, value);
      }
    } else {
      throw new Error('No ID present: could not update the dom:' + id);
    }
  },

  /**
   * Empty out all the children and update.
   * @param {!glift.svg.SvgObj} obj
   */
  emptyChildrenAndUpdate: function(obj) {
    obj.emptyChildren();
    var elem = document.getElementById(obj.idOrThrow());
    while (elem && elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
  },
};
