/**
 * Marked is dumped into this namespace. Just for reference
 * https://github.com/chjj/marked
 */
// glift.marked = {};

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


/** Wrapper object for the abstract syntax tree. */
glift.markdown.Ast = function(tree) {
  /** From marked, this is an  */
  this.tree = tree;
};

glift.markdown.Ast.prototype = {
  /**
   * Returns the headers. We assume no nested headers.
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
