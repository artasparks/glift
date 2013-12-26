/**
 * Return a gooe diagram.
 */
glift.displays.diagrams.gooe = {
  charMapping: {
    // Lines
    TL_CORNER:  '\0??<',
    TR_CORNER:  '\0??>',
    BL_CORNER:  '\0??,',
    BR_CORNER:  '\0??.',
    TOP_EDGE:   '\0??(',
    BOT_EDGE:   '\0??)',
    LEFT_EDGE:  '\0??[',
    RIGHT_EDGE: '\0??]',
    CENTER:     '\0??+',
    CENTER_STARPOINT: '\0??*',
    // Stones
    BSTONE: '\0??@',
    WSTONE: '\0??!',

    // Marks and StoneMarks
    BSTONE_TRIANGLE: '\0??S',
    WSTONE_TRIANGLE: '\0??s',
    TRIANGLE:        '\0??3',
    BSTONE_SQUARE:   '\0??S',
    WSTONE_SQUARE:   '\0??s',
    SQUARE:          '\0??2',
    BSTONE_CIRCLE:   '\0??C',
    WSTONE_CIRCLE:   '\0??c',
    CIRCLE:          '\0??1',
    BSTONE_XMARK:    '\0??X',
    WSTONE_XMARK:    '\0??x',
    XMARK:           '\0??4',

    // BigBoard Numbering
    // Example: \003+.  Note, the board decides which 'color' is selected
    BSTONE_LABEL_BIG: '\goBsLblBig{%s}',
    WSTONE_LABEL_BIG: '\goWsLblBig{%s}',
    EMPTY_LABEL_BIG:  '\eLblBig{%s}',

    // SmalBoard Numbering
    BSTONE_LABEL: '\goBsLbl{%s}',
    WSTONE_LABEL: '\goWsLbl{%s}',
    EMPTY_LABEL:  '\eLbl{%s}',

    // Formatting
    BSTONE_INLINE:     '\goinBsLbl{%s}',
    WSTONE_INLINE:     '\goinWsLbl{%s}',
    MISC_STONE_INLINE: '\goinChar{%s}',
  },

  diagram: function(flattened) {
    var symb = glift.bridge.flattener.symbols;
    var cmap = glift.displays.diagrams.charMapping;
    var symbolPairs = flattened.symbolPairs;
    var repl = function(text, replace) {
      return text.replace("%s", replace);
    };
    var header = "{goo";
    var footer = "}";
    var lines = [[header]];
    for (var i = 0; i < symbolPairs.length; i++) {
      var symbolRow = symbolPairs[i];
      var outRow = [];
      for (var j = 0; j < symbolRow.length; j++) {
        var pair = symbolRow[j];
        var pt = glift.util.point(j, i);
        if (pair.base === symb.WSTONE) {
          switch(pair.mark) {
            case symb.EMPTY: outRow.push(cmap.WSTONE); break;
            case symb.TEXTLABEL: outRow.push(
              // TODO(kashomon): Get the label here
              repl(cmap.WSTONE_LABEL, 'foo')); break;
            case symb.TRIANGLE: outRow.push(cmap.WSTONE_TRIANGLE); break;
            case symb.SQUARE: outRow.push(cmap.WSTONE_SQUARE); break;
            case symb.SQUARE: outRow.push(cmap.WSTONE_CIRCLE); break;
            case symb.SQUARE: outRow.push(cmap.WSTONE_XMARK); break;
            default: outRow.push(cmap.XMARK);
          }
        } else if (pair.base === symb.BSTONE) {
          switch(pair.mark) {
            case symb.EMPTY: outRow.push(cmap.WSTONE); break;
            case symb.TEXTLABEL: outRow.push(
              repl(cmap.WSTONE_LABEL, cmap.WSTONE)); break;
            case symb.TRIANGLE: outRow.push(cmap.WSTONE_TRIANGLE); break;
            case symb.SQUARE: outRow.push(cmap.WSTONE_SQUARE); break;
            case symb.SQUARE: outRow.push(cmap.WSTONE_CIRCLE); break;
            case symb.SQUARE: outRow.push(cmap.WSTONE_XMARK); break;
            default: outRow.push(cmap.XMARK);
          }
        }
        var strSymbol = glift.bridge.flattener.symbolFromEnum(symbolRow[j]);
        outRow.push(strSymbol);
      }
      outArr.push(outRow.join(""));
    }
    outArr.push([footer]);
    return outArr.join("\n");
  },

  defs: {
    sizeDefs: [
      '% Size definitions',
      '\newdimen\bigRaise',
      '\bigRaise=4.3pt',
      '\newdimen\smallRaise',
      '\smallRaise=3.5pt',
      '\newdimen\inlineRaise',
      '\inlineRaise=3.5pt'
    ],
    bigBoardDefs: [
      '% Big-sized board defs',
      '\def\eLblBig#1{\leavevmode\hbox to \goIntWd{\hss\raise\bigRaise\hbox{\rm \tenpointeleven{#1}}\hss}}',
      '\def\goWsLblBig#1{\setbox0=\hbox{\0??!}\rlap{\0??!}\raise\bigRaise\hbox to \wd0{\hss\tenpointeleven{#1}\hss}}',
      '\def\goBsLblBig#1{\setbox0=\hbox{\0??@}\rlap{\0??@}\raise\bigRaise\hbox to \wd0{\hss\color{white}\tenpointeleven{#1}\color{white}\hss}}'
    ],
    normalBoardDefs: [
      '% Normal-sized board defs',
      '\def\eLbl#1{\leavevmode\hbox to \goIntWd{\hss\raise\smallRaise\hbox{\rm \tenpoint{#1}}\hss}}',
      '\def\goWsLbl#1{\setbox0=\hbox{\0??!}\rlap{\0??!}\raise\smallRaise\hbox to \wd0{\hss\eightpointnine{#1}\hss}}',
      '\def\goBsLbl#1{\setbox0=\hbox{\0??@}\rlap{\0??@}\raise\smallRaise\hbox to \wd0{\hss\color{white}\eightpointnine{#1}\color{white}\hss}}'
    ],
  },

  documentHeader: function(baseFont) {
    var baseFont = baseFont || 'cmss';
    var fontDefsBase = [
      '% Gooe font definitions',
      '\font\tenpoint=' + baseFont + '10pt',
      '\font\tenpointeleven=' + baseFont + '10 at 11pt',
      '\font\eightpoint=' + baseFont + '8pt',
      '\font\eightpointnine=' + baseFont + '8 at 9pt'
    ]
    var out = [].concat(fontDefsBase);
    var defs = glift.displays.diagrams.gooe.defs;
    // for (var key in glift.displays.diagrams
  }
};
