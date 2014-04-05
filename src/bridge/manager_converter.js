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
    var managerConverter = glift.bridge.managerConverter;
    var globalBookData = manager.bookData;

    document.push(gooe.documentHeader());
    document.push(gooe.generateTitleDef(
        globalBookData.title,
        globalBookData.subtitle,
        globalBookData.authors,
        globalBookData.publisher));
    document.push('');
    document.push(gooe.startDocument());

    manager.prepopulateCache(function() {
      var curPageBuf = 1;
      var maxPageBuf = globalBookData.diagramsPerPage;

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
          if (globalBookData.autoNumber) {
            var out = glift.rules.treepath.findNextMoves(
                movetree, undefined, sobj.bookData.minusMovesOverride);
            movetree = out.movetree;
            treepath = out.treepath;
            nextMovesPath = out.nextMoves;
          }
          var goban = glift.rules.goban.getFromMoveTree(movetree).goban;
          var startNum = 1; // TODO(kashomon): change
          var flattened = glift.bridge.flattener.flatten(
              movetree, goban, boardRegion, showVars, nextMovesPath, startNum);

          var diagramStr = '';
          if (sobj.bookData.showDiagram) {
            diagramStr = managerConverter.createDiagram(flattened, sobj.bookData);
          }
          var tex = managerConverter.typesetDiagram(
              diagramStr, flattened.comment, sobj.bookData);

          if (!sobj.bookData.chapterTitle && curPageBuf < maxPageBuf) {
            document.push('\\newpage');
            curPageBuf++;
          } else {
            curPageBuf = 1;
          }

          document.push(tex);
        });
      }
      document.push(gooe.defs.basicFooter);
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

  typesetDiagram: function(str, comment, bookData) {
    var bookTypes = glift.enums.bookTypes;
    var gooe = glift.displays.diagrams.gooe;
    // console.log(bookData);
    if (bookData.diagramType === bookTypes.GAME_REVIEW) {
      if (bookData.chapterTitle) {
        return gooe.gameReviewChapterDiagram(str, comment, bookData.chapterTitle);
      } else {
        return gooe.gameReviewDiagram(str, comment);
      }
    }
  }
};
