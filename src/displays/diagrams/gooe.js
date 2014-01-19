/**
 * Create a gooe-font diagram.
 */
glift.displays.diagrams.gooe = {
  charMapping: {
    // BASE
    TL_CORNER: '\\0??<',
    TR_CORNER: '\\0??>',
    BL_CORNER: '\\0??,',
    BR_CORNER: '\\0??.',
    TOP_EDGE: '\\0??(',
    BOT_EDGE: '\\0??)',
    LEFT_EDGE: '\\0??[',
    RIGHT_EDGE: '\\0??]',
    CENTER: '\\0??+',
    CENTER_STARPOINT: '\\0??*',
    BSTONE: '\\0??@',
    WSTONE: '\\0??!',

    EMPTY: '\\eLbl{_}',

    // Marks and StoneMarks
    BSTONE_TRIANGLE: '\\0??S',
    WSTONE_TRIANGLE: '\\0??s',
    TRIANGLE: '\\0??3',
    BSTONE_SQUARE: '\\0??S',
    WSTONE_SQUARE: '\\0??s',
    SQUARE: '\\0??2',
    BSTONE_CIRCLE: '\\0??C',
    WSTONE_CIRCLE: '\\0??c',
    CIRCLE: '\\0??1',
    BSTONE_XMARK: '\\0??X',
    WSTONE_XMARK: '\\0??x',
    XMARK: '\\0??4',
    BSTONE_TEXTLABEL: '\\goBsLbl{%s}',
    WSTONE_TEXTLABEL: '\\goWsLbl{%s}',
    TEXTLABEL: '\\eLbl{%s}'

    // BigBoard TextLabels
    // BSTONE_LABEL_BIG: '\goBsLblBig{%s}',
    // WSTONE_LABEL_BIG: '\goWsLblBig{%s}',
    // TEXTLABEL_BIG: '\eLblBig{%s}',

    // Formatting.  Should these be there?
    // BSTONE_INLINE: '\goinBsLbl{%s}',
    // WSTONE_INLINE: '\goinWsLbl{%s}',
    // MISC_STONE_INLINE: '\goinChar{%s}',
  },

  diagramArray: function(flattened) {
    var symbolFromEnum = glift.bridge.flattener.symbolFromEnum;
    var symb = glift.bridge.flattener.symbols;
    var cmap = glift.displays.diagrams.gooe.charMapping;
    var symbolPairs = flattened.symbolPairs;
    var repl = function(text, toInsert) {
      return text.replace("%s", toInsert);
    };
    var header = "{\\goo";
    var footer = "}";
    var lines = [[header]];
    for (var i = 0; i < symbolPairs.length; i++) {
      var symbolRow = symbolPairs[i];
      var outRow = [];
      for (var j = 0; j < symbolRow.length; j++) {
        var pair = symbolRow[j];
        var pt = glift.util.point(j, i);
        var intPt = flattened.ptToIntpt(pt);
        
        var base = pair.base;
        var baseName = symbolFromEnum(base);
        var mark = pair.mark;
        var markName = symbolFromEnum(mark);
        var combinedName = baseName + '_' + markName;
        // glift.util.logz(combined)

        var outChar = cmap.EMPTY;
        if (mark === symb.TEXTLABEL) {
          var lbl = flattened.getLabel(pt);
          switch(pair.base) {
            case symb.WSTONE:
              outChar = repl(cmap.WSTONE_TEXTLABEL, lbl); break;
            case symb.BSTONE:
              outChar = repl(cmap.BSTONE_TEXTLABEL, lbl); break;
            default: 
              outChar = repl(cmap.TEXTLABEL, lbl);
          }
        } else if (cmap[combinedName] !== undefined) {
          outChar = cmap[combinedName];
        } else if (cmap[markName] !== undefined && markName !== "EMPTY") {
          outChar = cmap[markName]; // For marks on EMPTY intersections.
        } else if (cmap[baseName] !== undefined) {
          outChar = cmap[baseName];
        }
        outRow.push(outChar);
      }
      lines.push(outRow);
    }
    lines.push([footer]);
    return lines;
  },

  diagramArrToString: function(diagramArray) {
    outArr = [];
    for (var i = 0; i < diagramArray.length; i++) {
      outArr.push(diagramArray[i].join(""));
    }
    return outArr.join("\n");
  },

  defs: {
    basicHeader: [
      '\\documentclass[a5paper]{book}',
      '\\usepackage{gooemacs}',
      '\\usepackage{xcolor}',
      '\\usepackage{wrapfig}',
      '\\usepackage{unicode}',
      '\\usepackage[margin=1in]{geometry}',
      '\\begin{document}'
    ],
    basicFooter: ['\\end{document}'],

    problemHeader: ['\\begin{center}'],
    problemFooter: ['\\end{center}'],

    sizeDefs: [
      '% Size definitions',
      '\\newdimen\\bigRaise',
      '\\bigRaise=4.3pt',
      '\\newdimen\\smallRaise',
      '\\smallRaise=3.5pt',
      '\\newdimen\\inlineRaise',
      '\\inlineRaise=3.5pt'
    ],
    bigBoardDefs: [
      '% Big-sized board defs',
      '\\def\\eLblBig#1{\\leavevmode\\hbox to \\goIntWd{\\hss\\raise\\bigRaise\\hbox{\\rm \\tenpointeleven{#1}}\\hss}}',
      '\\def\\goWsLblBig#1{\\setbox0=\\hbox{\\0??!}\\rlap{\\0??!}\\raise\\bigRaise\\hbox to \\wd0{\\hss\\tenpointeleven{#1}\\hss}}',
      '\\def\\goBsLblBig#1{\\setbox0=\\hbox{\\0??@}\\rlap{\\0??@}\\raise\\bigRaise\\hbox to \\wd0{\\hss\\color{white}\\tenpointeleven{#1}\\color{white}\\hss}}'
    ],
    normalBoardDefs: [
      '% Normal-sized board defs',
      '\\def\\eLbl#1{\\leavevmode\\hbox to \\goIntWd{\\hss\\raise\\smallRaise\\hbox{\\rm \\tenpoint{#1}}\\hss}}',
      '\\def\\goWsLbl#1{\\leavevmode\\setbox0=\\hbox{\\0??!}\\rlap{\\0??!}\\raise\\smallRaise\\hbox to \\wd0{\\hss\\eightpointnine{#1}\\hss}}',
      '\\def\\goBsLbl#1{\\leavevmode\\setbox0=\\hbox{\\0??@}\\rlap{\\0??@}\\raise\\smallRaise\\hbox to \\wd0{\\hss\\color{white}\\eightpointnine{#1}\\color{white}\\hss}}'
    ]
  },

  documentHeader: function(baseFont) {
    var baseFont = baseFont || 'cmss';
    var fontDefsBase = [
      '% Gooe font definitions',
      '\\font\\tenpoint=' + baseFont + '10',
      '\\font\\tenpointeleven=' + baseFont + '10 at 11pt',
      '\\font\\eightpoint=' + baseFont + '8',
      '\\font\\eightpointnine=' + baseFont + '8 at 9pt'
    ]
    var defs = glift.displays.diagrams.gooe.defs;
    var out = [].concat(defs.basicHeader)
      .concat(fontDefsBase)
      .concat(defs.sizeDefs)
      .concat(defs.normalBoardDefs)
    return out.join("\n");
  }
};
