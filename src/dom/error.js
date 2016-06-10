goog.provide('glift.dom.ErrorDoc');

/**
 * Simple registry of Glift error docs.
 * @enum{string}
 */
glift.dom.ErrorDoc = {
  // TODO(kashomon): Add a real link
  SGF_PARSE_ERRROR: 'foo',
};


/**
 * Handles an error by createing a dom element with the right styling.
 * @param {string} msg User-level error message.
 * @param {glift.dom.ErrorDoc=} opt_docLink An optional link to docs.
 * @return {!Element} A new error element.
 */
glift.dom.error = function(msg, opt_docLink) {
  var elem = document.createElement('div');
  elem.style['color'] = '#E00';
  msg = '::Glift Error::' + msg
  elem.appendChild(document.createTextNode(msg));
  if (opt_docLink) {
    var link = document.createElement('a');
    link.href = opt_docLink
    var textNode = document.createTextNode(
        ' See here for more details.');
    link.appendChild(textNode);
    elem.appendChild(link);
  }
  return elem;
};
