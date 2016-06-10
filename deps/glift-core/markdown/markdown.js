goog.provide('glift.markdown');
goog.provide('glift.markdown.Ast');

goog.require('glift.marked');

/**
 * Marked is dumped into this namespace. Just for reference
 * https://github.com/chjj/marked
 */
glift.markdown = {
  /** Render the AST from some text. */
  renderAst: function(text) {
    // We expect the markdown extern to be exposed.
    var lex = glift.marked.lexer(text);
    return new glift.markdown.Ast(lex);
  },

  render: function(text) {
    return glift.marked(text);
  }
};

/**
 * Wrapper object for the abstract syntax tree.
 *
 * @param {!Array<!glift.marked.Token>} tree Array of tokens.
 * @constructor @final @struct
 */
glift.markdown.Ast = function(tree) {
  /** The token array */
  this.tree = tree;
};

glift.markdown.Ast.prototype = {
  /**
   * Returns just the headers. We assume no nested headers.
   * @return{!Array<!glift.marked.Token>} Array of header tokens.
   */
  headers: function() {
    var out = [];
    for (var i = 0; i < this.tree.length; i++) {
      var elem = this.tree[i];
      if (elem.type === 'heading') {
        out.push(elem);
      }
    }
    return out;
  }
};
