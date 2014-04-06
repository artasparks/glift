/**
 * Convert all the panels in a widget manager into some form.
 */
glift.bridge.managerConverter = {
  /**
   * Convert all the panels in a widget manager into a LaTeX book using gooe
   * fonts. Returns the string form of the book
   */
  toBook: function(manager, callback) {
    var document = [];
    var showVars = glift.enums.showVariations.NEVER;
    var gooe = glift.displays.diagrams.gooe;
    var latex = glift.displays.diagrams.latex;
    var managerConverter = glift.bridge.managerConverter;
    var globalBookData = manager.bookData;
    var diagramTypes = glift.enums.diagramTypes;

    document.push(latex.basicHeader());
    document.push(gooe.gooeDefs());
    document.push(latex.generateTitleDef(
        globalBookData.title,
        globalBookData.subtitle,
        globalBookData.authors,
        globalBookData.publisher));
    document.push('');
    document.push(latex.diagramLabelMacros());
    document.push(latex.startDocument());

    manager.prepopulateCache(function() {
      var maxPageBuf = globalBookData.diagramsPerPage;
      var counts = {
        curPageBuf: 1,
        varDiags: 1,
        mainDiags: 1
      };

      for (var i = 0, len = manager.sgfList.length; i < len; i++) {
        var curObj = manager.getSgfObj(i),
            boardRegion = curObj.boardRegion,
            initPos = curObj.initialPosition,
            treepath = glift.rules.treepath.parseInitPosition(initPos),
            nextMovesPath = [];

        // This should be synchronous since we've prepopulated the cache.
        manager.getSgfString(curObj, function(sobj) {
          // Movetree at root.
          var movetree = glift.rules.movetree.getFromSgf(sobj.sgfString, treepath);
          var isMainline = movetree.onMainline();
          if (isMainline) { counts.mainDiags++; }
          else { counts.varDiags++; }

          if (globalBookData.autoNumber) {
            var out = glift.rules.treepath.findNextMoves(
                movetree,
                undefined,
                sobj.bookData.minusMovesOverride,
                sobj.bookData.diagramType === diagramTypes.GAME_REVIEW);
            movetree = out.movetree;
            treepath = out.treepath;
            nextMovesPath = out.nextMoves;
          }
          var goban = glift.rules.goban.getFromMoveTree(movetree).goban;
          var startNum = isMainline ? movetree.node().getNodeNum() + 1 : 1;
          var flattened = glift.bridge.flattener.flatten(
              movetree, goban, boardRegion, showVars, nextMovesPath, startNum);

          var diagramStr = '';
          if (sobj.bookData.showDiagram) {
            diagramStr = managerConverter.createDiagram(flattened, sobj.bookData);
          }
          var tex = managerConverter.typesetDiagram(
              diagramStr, flattened.comment, sobj.bookData,
              flattened.collisions, isMainline);

          if (!sobj.bookData.chapterTitle && counts.curPageBuf < maxPageBuf) {
            document.push('\\newpage');
            counts.curPageBuf++;
          } else {
            counts.curPageBuf = 1;
          }

          document.push(tex);
        });
      }
      document.push(latex.basicFooter);
      callback(document.join("\n"));
    });
  },

  createDiagram: function(flattened, bookData) {
    var gooe = glift.displays.diagrams.gooe;
    var size = glift.enums.diagramSize.NORMAL;
    if (bookData.chapterTitle) {
      size = glift.enums.diagramSize.LARGE;
    }
    var gooeArray = gooe.diagramArray(flattened, size);
    var diagram = gooe.diagramArrToString(gooeArray);
    return diagram;
  },

  /**
   * Typeset the diagram into LaTeX
   */
  typesetDiagram: function(str, comment, bookData, collisions, isMainline) {
    var diagramTypes = glift.enums.diagramTypes;
    var latex = glift.displays.diagrams.latex;
    var label = '';
    if (bookData.diagramType === diagramTypes.GAME_REVIEW) {
      if (bookData.showDiagram) {
        var label = isMainline ? '\\gofigure' : '\\godiagram';
        var collisionLabel = latex.labelForCollisions(collisions);
        if (collisionLabel.length > 0) {
          label += '\n\n' + ' \\subtext{' + collisionLabel + '}';
        }
      }
      if (bookData.chapterTitle) {
        return latex.gameReviewChapterDiagram(
            str, comment, bookData.chapterTitle, label);
      } else {
        return latex.gameReviewDiagram(str, comment, label);
      }
    }
  }
};
