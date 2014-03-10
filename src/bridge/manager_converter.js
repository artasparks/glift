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
    document.push(gooe.documentHeader());
    document.push('');

    manager.prepopulateCache(function() {
      for (var i = 0, len = manager.sgfList.length; i < len; i++) {
        var curObj = manager.getSgfObj(i);
        // console.log(curObj);
        var boardRegion = curObj.boardRegion;
        var initPos = curObj.initialPosition;
        var treepath = glift.rules.treepath.parseInitPosition(initPos);
        var nextMovesTreepath = [];
        // console.log(treepath);

        // This should be synchronous, since we've prepopulated the cache.
        manager.getSgfString(curObj, function(sgfObj) {
          var initPos = curObj.initialPosition;
          var movetree = glift.rules.movetree.getFromSgf(sgfObj.sgfString, treepath);
          var goban = glift.rules.goban.getFromMoveTree(movetree, treepath).goban;
          var flattened = glift.bridge.flattener.flatten(
              movetree, goban, boardRegion, showVars, nextMovesTreepath);
          var gooeArray = glift.displays.diagrams.gooe.diagramArray(flattened);
          var strOut = glift.displays.diagrams.gooe.diagramArrToString(gooeArray);

          document.push('\\vfill');
          document.push('\\newpage');
          document.push(strOut);
          document.push(flattened.comment)
        });
      }
      document.push(gooe.defs.basicFooter);
      callback(document.join("\n"));
    });
  }
};
