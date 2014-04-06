glift.displays.diagrams.latex = {
  basicHeader_: [
      '\\documentclass[letterpaper,12pt]{memoir}',
      '\\usepackage{gooemacs}',
      '\\usepackage{color}',
      '\\usepackage{wrapfig}',
      '\\usepackage{setspace}',
      '\\usepackage{unicode}',
      '\\usepackage[margin=1in]{geometry}',
      '',
      '\\setlength{\\parskip}{0.5em}',
      '\\setlength{\\parindent}{0pt}'
  ],

  /** Basic latex header. Uses memoir class. */
  basicHeader: function() {
    return glift.displays.diagrams.latex.basicHeader_.join('\n');
  },

  /** Diagram label macros. For making Figure.1, Dia.1, etc. */
  diagramLabelMacros: function() {
    return [
        '% Mainline Diagrams. reset at parts',
        '\\newcounter{GoFigure}[part]',
        '\\newcommand{\\gofigure}{%',
        ' \\stepcounter{GoFigure}',
        ' \\centerline{\\textit{Figure.\\thinspace\\arabic{GoFigure}}}',
        '}',
        '% Variation Diagrams. reset at parts.',
        '\\newcounter{GoDiagram}[part]',
        '\\newcommand{\\godiagram}{%',
        ' \\stepcounter{GoDiagram}',
        ' \\centerline{\\textit{Diagram.\\thinspace\\arabic{GoDiagram}}}',
        '}',
        '\\newcommand{\\subtext}[1]{\\centerline{\\textit{#1}}}',
        ''].join('\n');
  },

  /** Basic latex footer */
  basicFooter: '\\end{document}',

  /**
   * title: title of the book as string
   * author: array of one or several authors as array af string
   * subtitle: the subtitle as string
   * publisher: the publisher as string
   *
   * returns: filled in string.
   */
  generateTitleDef: function(title, subtitle, authors, publisher) {
    var strbuff = [
        '\\definecolor{light-gray}{gray}{0.55}',
        '\\newcommand*{\\mainBookTitle}{\\begingroup',
        '  \\raggedleft'];
    for (var i = 0; i < authors.length; i++) {
      strbuff.push('  {\\Large ' + authors[i] + '} \\\\')
      if (i === 0) {
        strbuff.push('  \\vspace*{0.5 em}');
      } else if (i < authors.length - 1) {
        strbuff.push('  \\vspace*{0.5 em}');
      }
    }
    return strbuff.concat(['  \\vspace*{5 em}',
        '  {\\textcolor{light-gray}{\\Huge ' + title + '}}\\\\',
        '  \\vspace*{\\baselineskip}',
        '  {\\small \\bfseries ' + subtitle + '}\\par',
        '  \\vfill',
        '  {\\Large ' + publisher + '}\\par',
        '  \\vspace*{2\\baselineskip}',
        '\\endgroup}']).join('\n');
  },

  /**
   * Start the latex document by doing \begin{document} and rendering some basic
   * frontmatter.
   */
  startDocument: function() {
    return [
        '\\begin{document}',
        '',
        '\\pagestyle{empty}',
        '\\mainBookTitle',
        '\\newpage',
        '\\tableofcontents',
        '',
        '\\chapterstyle{section}',
        '\\pagestyle{companion}',
        '\\makepagestyle{headings}',
        '\\renewcommand{\\printchapternum}{\\space}',
        '\\makeevenhead{headings}{\\thepage}{}{\\slshape\\leftmark}',
        '\\makeoddhead{headings}{\\slshape\\rightmark}{}{\\thepage}'
        ].join('\n');
  },

  /**
   * Generate a GameReview diagram.
   *
   * diagramString: Literal string for the diagram
   * comment: Comment for diagram
   * label: Diagram label
   *
   * returns: filled-in latex string.
   */
  gameReviewDiagram: function(diagramString, comment, label) {
    return [
      '',
      '\\rule{\\textwidth}{0.5pt}',
      '',
      '\\begin{minipage}[t]{0.5\\textwidth}',
      diagramString,
      label,
      '\\end{minipage}',
      '\\begin{minipage}[t]{0.5\\textwidth}',
      '\\setlength{\\parskip}{0.5em}',
      comment,
      '\\end{minipage}',
      '\\vfill'].join('\n');
  },

  /**
   * Generate a Game Review Chapter Diagram.
   */
  gameReviewChapterDiagram: function(diagStr, comment, title, label) {
    return [
        '\\chapter{' + title + '}',
        '{\\centering',
        diagStr,
        '}',
        label,
        '',
        comment,
        '\\vfill'].join('\n');
  },

  /**
   * Collisions is an array of collisions objects, having the form:
   *    {color: <color>, mvnum: <number>, label: <str label>}
   *
   * returns: stringified label format.
   */
  labelForCollisions: function(collisions) {
    if (!collisions ||
        glift.util.typeOf(collisions) !== 'array' ||
        collisions.length === 0) {
      return '';
    }
    var buffer = [];
    for (var i = 0; i < collisions.length; i++) {
      var c = collisions[i];
      var col = c.color === glift.enums.states.BLACK ? 'Black' : 'White';
      buffer.push(col + ' ' + c.mvnum + ' at ' + c.label);
    }
    return buffer.join(', ') + '.'
  }
};
