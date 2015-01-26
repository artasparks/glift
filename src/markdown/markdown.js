/** Markdown JS is dumped into this namespace. */
glift.markdownjs = {};

glift.markdown = {
  elemType: {
    /** p */
    para: 'para',

    /** header */
    header: 'header',
  },

  /** Render the AST from some text. */
  renderAst: function(text) {
    // We expect the markdown extern to be exposed.
    return new glift.markdown.Ast(glift.markdownjs.parse(text));
  }
};


/** Wrapper object for the abstract syntax tree. */
glift.markdown.Ast = function(tree) {
  this.tree = tree;
};

glift.markdown.Ast.prototype = {
  /** Returns the headers. */
  getHeaders: function() {
    var out = [];
    for (var i = 1; i < this.tree.length; i++) {
      var elem = this.tree[i];
      if (elem[0] ===  glift.markdown.elemType.header) {
        out.push(new glift.markdown.Elem(
            elem[0],
            elem[elem.length - 1],
            elem));
      }
    }
    return out;
  }
};

glift.markdown.Elem = function(type, content, fullData) {
  this.type = type;
  this.content = content;
  this.fullData = fullData;
};
