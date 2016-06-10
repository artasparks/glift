goog.provide('glift.markdown.Renderer');

goog.scope(function() {

/**
 * A renderer for use with Marked. This is a record type, so as to indicate the
 * types.
 *
 * @record
 */
glift.markdown.Renderer = function () {}

var Renderer = glift.markdown.Renderer;

/**
 * Renders a code block.
 * @param {string} code
 * @param {string} language
 * @return {string}
 */
Renderer.prototype.code = function(code, language) {};

/**
 * Renders a blockquote.
 * @param {string} quote
 * @return {string}
 */
Renderer.prototype.blockquote = function(quote) {};

/**
 * Renders HTML.
 * @param {string} html
 * @return {string}
 */
Renderer.prototype.html = function(html) {};

/**
 * Renders a header/heading.
 * @param {string} text The text
 * @param {number} level Of the header
 * @return {string}
 */
Renderer.prototype.heading = function(text, level) {};

/**
 * Renders a horizontal rule.
 * @return {string} The horizontal rule.
 */
Renderer.prototype.hr = function() {};

/**
 * Render a list
 * @param {string} body
 * @param {boolean} ordered Whether the list is an ordered list.
 * @return {string}
 */
Renderer.prototype.list = function(body, ordered) {};

/**
 * Render a list item
 * @param {string} text
 * @return {string}
 */
Renderer.prototype.listitem = function(text) {};

/**
 * Render a paragraph
 * @param {string} text
 * @return {string}
 */
Renderer.prototype.paragraph = function(text) {};

/**
 * @param {string} header
 * @param {string} body
 * @return {string}
 */
Renderer.prototype.table = function(header, body) {};

/**
 * @param {string} content
 * @return {string}
 */
Renderer.prototype.tablerow = function(content) {};

/**
 * @param {string} content
 * @param {!Object} flags
 * @return {string}
 */
Renderer.prototype.tablecell = function(content, flags) {};

///////////////////////////////////
// Inline level renderer methods //
///////////////////////////////////

/**
 * @param {string} text
 * @return {string}
 */
Renderer.prototype.strong = function(text) {};

/**
 * @param {string} text
 * @return {string}
 */
Renderer.prototype.em = function(text) {};

/**
 * @param {string} code
 * @return {string}
 */
Renderer.prototype.codespan = function(code) {};

/** @return {string} Rendered line break. */
Renderer.prototype.br = function() {};

/**
 * @param {string} text
 * @return {string}
 */
Renderer.prototype.del = function(text) {};

/**
 * Render a link.
 * @param {string} href
 * @param {string} title
 * @param {string} text
 * @return {string}
 */
Renderer.prototype.link = function(href, title, text) {};

/**
 * @param {string} image
 * @param {string} title
 * @param {string} text
 * @return {string}
 */
Renderer.prototype.image = function(image, title, text) {};

});
