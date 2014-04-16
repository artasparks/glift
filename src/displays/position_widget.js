/**
 * Find the optimal positioning of the widget. Creates divs for all the
 * necessary elements and then returns the divIds. Specifically, returns:
 *  {
 *    commentBox: ...
 *    goBox: ...
 *    iconBox: ...
 *  }
 */
glift.displays.positionWidget = function(
    divBox, boardRegion, ints, boardComponentsList, onecSplits, twocSplits) {
  var comps = glift.enums.boardComponents;
  var bcMap = {}
  for (var i = 0; i < boardComponentsList.length; i++) {
    bcMap[boardComponentsList[i]] = true;
  }
  var cropbox = glift.displays.cropbox.getFromRegion(boardRegion, ints);

  // These are simple heuristics.  They do not optimally place the board, but I
  // prefer the simplicity.
  var longBoxRegions = { TOP: true, BOTTOM: true };
  if (!bcMap.hasOwnProperty(comps.COMMENT_BOX)) {
    return glift.displays.positionWidgetVert(
        divBox, cropbox, boardRegion, bcMap);
  } else if (divBox.hwRatio() < 0.45 && longBoxRegions[boardRegion]) {
    return glift.displays.positionWidgetHorz(
        divBox, cropbox, boardRegion, bcMap);
  } else if (divBox.hwRatio() < 0.600 && !longBoxRegions[boardRegion]) {
    // In other words, the width == 1.5 * height;
    // Also: Requires a comment box
    return glift.displays.positionWidgetHorz(
        divBox, cropbox, boardRegion, bcMap);
  } else {
    // Default: Vertically aligned.
    return glift.displays.positionWidgetVert(
        divBox, cropbox, boardRegion, bcMap);
  }
};

glift.displays.positionWidgetVert = function(
    divBox, cropbox, boardRegion, boardComponentsMap) {
  var point = glift.util.point;
  var aligns = glift.enums.boardAlignments;
  var comps = glift.enums.boardComponents;
  var outBoxes = {};
  var splitPercentages = [];
  var boardBase = undefined;
  var iconBarBase = undefined;
  var commentBase = undefined;
  var extraIconBarBase = undefined;
  if (boardComponentsMap.hasOwnProperty(comps.COMMENT_BOX) &&
      boardComponentsMap.hasOwnProperty(comps.ICONBAR) &&
      boardComponentsMap.hasOwnProperty(comps.EXTRA_ICONBAR)) {
    var splits = divBox.hSplit([0.6, 0.2, 0.1]);
    boardBase = splits[0];
    commentBase = splits[1];
    iconBarBase = splits[2];
    extraIconBarBase = splits[3];
  } else if (boardComponentsMap.hasOwnProperty(comps.COMMENT_BOX) &&
      boardComponentsMap.hasOwnProperty(comps.ICONBAR)) {
    var splits = divBox.hSplit([0.7, 0.2]);
    boardBase = splits[0];
    commentBase = splits[1];
    iconBarBase = splits[2];
  } else if (boardComponentsMap.hasOwnProperty(comps.ICONBAR)) {
    var splits = divBox.hSplit([0.9]);
    boardBase = splits[0];
    iconBarBase = splits[1];
  } else if (boardComponentsMap.hasOwnProperty(comps.COMMENT_BOX)) {
    var splits = divBox.hSplit([0.8]);
    boardBase = splits[0];
    commentBase = splits[1];
  } else {
    boardBase = divBox;
  }

  var board = glift.displays.getResizedBox(boardBase, cropbox, aligns.TOP);
  outBoxes.boardBox = board;
  if (commentBase) {
    var bb = outBoxes.boardBase;
    var commentHeight = commentBase.height();
    var boardWidth = board.width();
    var boardLeft = board.left();
    var boardBottom = board.bottom();
    outBoxes.commentBox = glift.displays.bbox(
        point(boardLeft, boardBottom), boardWidth, commentHeight);
  }
  if (iconBarBase) {
    var bb = outBoxes.boardBase;
    var barHeight = iconBarBase.height();
    var boardLeft = board.left();
    var boardWidth = board.width();
    if (outBoxes.commentBox) {
      var bottom = outBoxes.commentBox.bottom();
    } else {
      var bottom = outBoxes.boardBox.bottom();
    }
    outBoxes.iconBarBox = glift.displays.bbox(
        point(boardLeft, bottom), boardWidth, barHeight);
  }
  if (extraIconBarBase) {
    var bb = outBoxes.boardBase;
    var barHeight = extraIconBarBase.height();
    var boardLeft = board.left();
    var boardWidth = board.width();
    if (outBoxes.iconBarBox) {
      var bottom = outBoxes.iconBarBox.bottom();
    } else {
      var bottom = outBoxes.boardBox.bottom();
    }
    outBoxes.extraIconBarBox = glift.displays.bbox(
        point(boardLeft, bottom), boardWidth, barHeight);
  }
  return outBoxes;
};

/**
 * Position a widget horizontally, i.e.,
 * |   X   X   |
 *
 * Since a resizedBox is designed to fill up either the h or w dimension. There
 * are only three scenarios:
 *  1. The GoBoardBox naturally touches the top & bottom
 *  2. The GoBoardBox naturally touches the left & right
 *  2. The GoBoardBox fits perfectly.
 *
 * Note, we should never position horizontally for TOP and BOTTOM board regions.
 *
 * returns:
 *
 *  {
 *    boardBox: ...
 *    commentBox: ...
 *    iconBarBox: ...
 *    rightSide: ...
 *    leftSide: ....
 *  }
 */
glift.displays.positionWidgetHorz = function(
    divBox, cropbox, boardRegion, boardComponentsMap) {
  var point = glift.util.point;
  var aligns = glift.enums.boardAlignments;
  var comps = glift.enums.boardComponents;
  if (!comps.hasOwnProperty(comps.COMMENT_BOX)) {
    throw "The component map must contain a comment box";
  }
  var boardBox = glift.displays.getResizedBox(divBox, cropbox, aligns.RIGHT);
  var outBoxes = {};

  // These are precentages of boardWidth.  We require a minimum width of 1/2 the
  // GoBoardWidth.
  // TODO(kashomon): Make this configurable.
  var minCommentPercent = 0.5;
  var minCommentBoxSize = boardBox.width() * minCommentPercent;
  var maxCommentPercent = 0.75;
  var maxCommentBoxSize = boardBox.width() * maxCommentPercent;
  var widthDiff = divBox.width() - boardBox.width();

  // The commentBoxPercentage is percentage of the width of the goboard that
  // we want the comment box to be.
  if (widthDiff < minCommentBoxSize) {
    var commentBoxPercentage = minCommentPercent;
  } else if (widthDiff >= minCommentBoxSize
      && widthDiff < maxCommentBoxSize) {
    var commentBoxPercentage = widthDiff / boardBox.width();
  } else {
    var commentBoxPercentage = maxCommentPercent;
  }
  outBoxes.commentBoxPercentage = commentBoxPercentage;

  // Split percentage is how much we want to split the boxes by.
  var desiredWidth = commentBoxPercentage * boardBox.width();
  var splitPercentage = boardBox.width() / (desiredWidth + boardBox.width());
  // This means that if the divBox is very wide (> maxCommentBoxSize +
  // boardWidth), so we just need to partition the box.
  var splits = divBox.vSplit([splitPercentage]);
  outBoxes.leftSide = splits[0];

  // Find out what the resized box look like now.
  var newResizedBox = glift.displays.getResizedBox(
      splits[0], cropbox, aligns.RIGHT);

  var rightSide = splits[1];
  outBoxes.rightSide = rightSide;
  var baseCommentBox = glift.displays.bboxFromPts(
      point(rightSide.topLeft().x(), newResizedBox.topLeft().y()),
      point(rightSide.botRight().x(), newResizedBox.botRight().y()));
  if (rightSide.width() > (0.75 * newResizedBox.width())) {
    baseCommentBox = baseCommentBox.vSplit(
        [0.75 * newResizedBox.width() / baseCommentBox.width()])[0];
  }

  if (boardComponentsMap.hasOwnProperty(comps.ICONBAR) &&
      boardComponentsMap.hasOwnProperty(comps.EXTRA_ICONBAR)) {
    var finishedBoxes = baseCommentBox.hSplit([0.8, 0.1]);
    outBoxes.commentBox = finishedBoxes[0];
    outBoxes.iconBarBox = finishedBoxes[1];
    outBoxes.extraIconBarBox = finishedBoxes[2];
  } else if (boardComponentsMap.hasOwnProperty(comps.ICONBAR)) {
    var finishedBoxes = baseCommentBox.hSplit([0.9]);
    outBoxes.commentBox = finishedBoxes[0];
    outBoxes.iconBarBox = finishedBoxes[1];
  } else {
    outBoxes.commentBox = baseCommentBox;
  }
  outBoxes.boardBox = newResizedBox;
  return outBoxes;
};

glift.displays.setNotSelectable = function(divId) {
  $('#' + divId).css({
      '-webkit-touch-callout': 'none',
      '-webkit-user-select': 'none',
      '-khtml-user-select': 'none',
      '-moz-user-select': 'moz-none',
      '-ms-user-select': 'none',
      'user-select': 'none',
      '-webkit-highlight': 'none',
      '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
      'cursor': 'default'
  });
};
