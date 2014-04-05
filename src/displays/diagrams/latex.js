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
        strbuff.push('  \\vspace*{0.2 em} % This is a hack =(');
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
   * isMainline: boolean for whether we're on the main line.
   *
   * returns: filled-in latex string.
   */
  gameReviewDiagram: function(
      diagramString, comment, isMainline) {
    return [
      '',
      '\\rule{\\textwidth}{0.5pt}',
      '',
      '\\begin{minipage}[t]{0.5\\textwidth}',
      diagramString,
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
  gameReviewChapterDiagram: function(str, comment, title, isMainline) {
    return [
        '\\chapter{' + title + '}',
        '{\\centering',
        str,
        '}',
        comment,
        '\\vfill'].join('\n');
  }
};
