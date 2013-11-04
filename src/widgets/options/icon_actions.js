glift.widgets.options.iconActions = {
  start: {
    click:  function(widget) {
      widget.applyBoardData(widget.controller.toBeginning());
    }
  },

  end: {
    click:  function(widget) {
      widget.applyBoardData(widget.controller.toEnd());
    }
  },

  arrowright: {
    click: function(widget) {
      widget.applyBoardData(widget.controller.nextMove());
    }
  },

  arrowleft: {
    click:  function(widget) {
      widget.applyBoardData(widget.controller.prevMove());
    }
  },

  _nextProblemInternal: function(widget, indexChange) {
    if (widget.options.sgfStringList.length > 0 ||
        widget.options.sgfUrlList.length > 0) {
      var listLength = widget.options.sgfUrlList.length > 0 ?
          widget.options.sgfUrlList.lengthx :
          widget.options.sgfStringList.length;
      var index = (widget.sgfIndex + indexChange + listLength) % listLength;
      widget.sgfIndex = index

      // Internal function used for ajax / non-ajax calls
      var loadSgfString = function(inputString) {
        widget.sgfString = inputString;
        widget.redraw();
      };

      // TODO(kashomon): Another terrible hack.  Really, I need to think
      // more clearly about what it means to 'reload' a plugin and where
      // state should be stored.
      widget.initialPosition = '';
      widget.problemType = glift.enums.problemTypes.AUTO;

      if (widget.options.sgfStringList.length > 0) {
        loadSgfString(widget.options.sgfStringList[index]);
      } else if (widget.options.sgfUrlList.length > 0) {
        var url = widget.options.sgfUrlList[index];
        widget.loadWithAjax(url, function(data) {
          loadSgfString(data);
        });
      }
    }
  },

  // Get next problem.
  'chevron-right': {
    click: function(widget) {
      widget.options.actions.icons._nextProblemInternal(widget, 1)
    }
  },

  // Get the previous problem.
  'chevron-left': {
    click: function(widget) {
      widget.options.actions.icons._nextProblemInternal(widget, -1)
    }
  },

  // Try again
  refresh: {
    click: function(widget) {
      widget.reload();
    }
  },

  // Go to the explain-board.
  roadmap: {
    click: function(widget) {
      // This is a terrible hack.  High yuck factor.
      widget._problemOptions = widget.originalOptions;
      widget.destroy();
      var returnAction = function(widget) {
        widget.destroy();
        widget.originalOptions = widget._problemOptions;
        widget.draw();
      };
      var optionsCopy = {
        divId: widget.originalOptions.divId,
        theme: widget.originalOptions.theme,
        sgfString: widget.originalOptions.sgfString,
        showVariations: glift.enums.showVariations.ALWAYS,
        problemConditions: widget.originalOptions.problemConditions,
        controllerFunc: glift.controllers.gameViewer,
        boardRegion: glift.enums.boardRegions.AUTO,
        icons: ['start', 'end', 'arrowleft', 'arrowright', 'undo'],
        actions: { icons: { undo : { click: returnAction }}}
      }
      widget.originalOptions = glift.widgets.options.setDefaults(
        optionsCopy, 'base');
      widget.draw();
    }
  }
};
