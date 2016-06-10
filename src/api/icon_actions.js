goog.provide('glift.api.IconActions');
goog.provide('glift.api.IconDef');
goog.provide('glift.api.IconFn');

/**
 * A typedef representing an action performed on the Go Board itself (clicking,
 * hovering, etc.)
 *
 * @typedef {function(
 *  !Event,
 *  !glift.widgets.BaseWidget,
 *  !glift.displays.icons.WrappedIcon,
 *  !glift.displays.icons.IconBar)
 * }
 */
glift.api.IconFn;

/**
 * An icon definition.
 * @typedef {{
 *  click: (!glift.api.IconFn|undefined),
 *  tooltip: (string|undefined)
 * }}
 */
glift.api.IconDef;

/**
 * A collection of Icon Actions.
 * @typedef {!Object<string, glift.api.IconDef>}
 */
glift.api.IconActions;

/**
 * The actions for the icons (see glift.displays.svg.icons).
 * @type {!glift.api.IconActions}
 */
glift.api.iconActionDefaults = {
  start: {
    click: function(event, widget, icon, iconBar) {
      widget.applyBoardData(widget.controller.toBeginning());
    },
    tooltip: 'Go to the beginning'
  },

  end: {
    click:  function(event, widget, icon, iconBar) {
      widget.applyBoardData(widget.controller.toEnd());
    },
    tooltip: 'Go to the end'
  },

  arrowright: {
    click: function(event, widget, icon, iconBar) {
      widget.applyBoardData(widget.controller.nextMove());
    },
    tooltip: 'Next move'
  },

  arrowleft: {
    click:  function(event, widget, icon, iconBar) {
      widget.applyBoardData(widget.controller.prevMove());
    },
    tooltip: 'Previous move'
  },

  // Get next problem.
  'chevron-right': {
    click: function(event, widget, icon, iconBar) {
      widget.manager.nextSgf();
    },
    tooltip: 'Next panel'
  },

  // Get the previous problem.
  'chevron-left': {
    click: function(event, widget, icon, iconBar) {
      widget.manager.prevSgf();
    },
    tooltip: 'Previous panel'
  },

  // Try again
  refresh: {
    click: function(event, widget, icon, iconBar) {
      widget.reload();
    },
    tooltip: 'Try the problem again'
  },

  // Undo for just problems (i.e., back one move).
  'undo-problem-move': {
    click:  function(event, widget, icon, iconBar) {
      if (widget.controller.movetree.node().getNodeNum() <=
          widget.initialMoveNumber) {
        return;
      }

      if (widget.initialPlayerColor === widget.controller.getCurrentPlayer()) {
        // If it's our move, then the last move was by the opponent -- we need
        // an extra move backwards.
        widget.applyBoardData(widget.controller.prevMove());
      }

      widget.applyBoardData(widget.controller.prevMove());
      if (widget.initialMoveNumber ===
          widget.controller.movetree.node().getNodeNum()) {
        // We're at the root.  We can assume correctness, so reset the widget.
        widget.reload();
      } else {
        var problemResults = glift.enums.problemResults;
        var correctness = widget.controller.correctnessStatus();
        widget.iconBar.destroyTempIcons();
        if (correctness === problemResults.CORRECT) {
            widget.iconBar.setCenteredTempIcon(
                'multiopen-boxonly', 'check', '#0CC');
            widget.correctness = problemResults.CORRECT;
        } else if (correctness === problemResults.INCORRECT) {
          widget.iconBar.destroyTempIcons();
          widget.iconBar.setCenteredTempIcon(
              'multiopen-boxonly', 'cross', 'red');
          widget.correctness = problemResults.INCORRECT;
        }
      }
    },
    tooltip: 'Undo last move attempt'
  },

  undo: {
    click: function(event, widget, icon, iconBar) {
      widget.manager.returnToOriginalWidget();
    },
    tooltip: 'Return to the parent widget'
  },

  'jump-left-arrow': {
    click: function(event, widget, icon, iconBar) {
      var maxMoves = 20;
      widget.applyBoardData(widget.controller.previousCommentOrBranch(maxMoves));
    },
    tooltip: 'Previous branch or comment'
  },

  'jump-right-arrow': {
    click: function(event, widget, icon, iconBar) {
      var maxMoves = 20;
      widget.applyBoardData(widget.controller.nextCommentOrBranch(maxMoves));
    },
    tooltip: 'Previous branch or comment'
  },

  // Go to the explain-board for a problem.
  // (was roadmap)
  'problem-explanation': {
    click: function(event, widget, icon, iconBar) {
      var manager = widget.manager;
      var sgfObj = {
        widgetType: glift.WidgetType.GAME_VIEWER,
        initialPosition: widget.controller.initialPosition,
        sgfString: widget.controller.originalSgf(),
        showVariations: glift.enums.showVariations.ALWAYS,
        problemConditions: glift.util.simpleClone(
            widget.sgfOptions.problemConditions),
        icons: [
          'jump-left-arrow',
          'jump-right-arrow',
          'arrowleft',
          'arrowright',
          'undo'
        ],
        rotation: widget.sgfOptions.rotation,
        boardRegion: widget.sgfOptions.boardRegion
      }
      manager.createTemporaryWidget(sgfObj);
    },
    tooltip: 'Explore the solution'
  },

  multiopen: {
    click: function(event, widget, icon, iconBar) {
      var ic = glift.displays.icons.iconSelector(
          widget.wrapperDivId,
          iconBar.divId,
          icon);
      ic.setIconEvents('click', function(event, wrappedIcon) {
        var multi = iconBar.getIcon('multiopen')
        multi.setActive(wrappedIcon.iconName);
        iconBar.setCenteredTempIcon('multiopen', multi.getActive(), 'black');
      });
    }
  },

  'multiopen-boxonly': {
    mouseover: function() {},
    mouseout: function() {},
    click: function() {},
    tooltip: 'Shows if the problem is solved'
  },

  //////////////////////
  // Status Bar Icons //
  //////////////////////

  'game-info': {
    click: function(event, widget, icon, iconBar) {
      widget.statusBar &&
      widget.statusBar.gameInfo(
          widget.controller.getGameInfo(),
          widget.controller.getCaptureCount());
    },
    tooltip: 'Show the game info'
  },

  'move-indicator': {
    click: function() {},
    mouseover: function() {},
    mouseout: function() {},
    tooltip: 'Shows the current move number'
  },

  fullscreen: {
    click: function(event, widget, icon, iconBar) {
      widget.statusBar && widget.statusBar.fullscreen();
    },
    tooltip: 'Expand display to fill entire screen.'
  },

  unfullscreen: {
    click: function(event, widget, icon, iconBar) {
      // We need to stop event propagation because often the un-fullscreen
      // button will be over some other clickable element.
      event.preventDefault && event.preventDefault();
      event.stopPropagation && event.stopPropagation();
      widget.statusBar && widget.statusBar.unfullscreen();
    },
    tooltip: 'Return display original size.'
  },

  'settings-wrench': {
    click: function() {},
    tooltip: 'Show Glift Settings'
  }
};
