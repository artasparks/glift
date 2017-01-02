/**
 * Helpers for constructing better labels. This contains logic for creating
 * label annotanions from collisions and helpers for replacing the stone labels
 * (i.e., with icons/images/etc.)
 *
 * This is largely designed for print (IRL books!) since it is only relevant for
 * a next-moves-path style Diagram, but also can be useful for Game-Figure-style
 * UIs.
 */
glift.flattener.labels = {
  /**
   * Regex for determining if a text should be considered an inline label.
   *
   * Roughly we look for Black or White followed by a valid label. Then, we
   * check to make sure the next character is one of:
   * 1. The end of the line
   * 2. Whitespace
   * 3. Some form of punctuation
   *
   * Valid labels
   * - Black A blah
   * - White 32
   * - Black (A)
   * - White (126)
   * - Black (x)
   * @type {!RegExp}
   */
  // TODO(kashomon): Support symbols? Ex: Black Triangle.
  inlineLabelRegex: new RegExp(
      '(Black|White) ' +
      '([A-Z]|([0-9]{1,3})|(\\(([A-Za-z]|[0-9]{1,3})\\)))' +
      '(?=($|\\n|\\r|\\s|["\',:;.$?~`<>{}\\[\\]()!@_-]))',
      ''),

  /**
   * Global version of the above. Must be defined lazily due the dependence on
   * the previous regex.
   * @private {?RegExp}
   */
  inlineLabelRegexGlobal_: null,

  /**
   * Supply a fn to replace stones found within text. In other words, we look
   * through comment text, replacing occurences of substrings like 'Black 12'.
   * What to replace these with is left up to the caller, but implicitly, the
   * expectation as that the caller will replace these with images (like an
   * image of a Black stone overlayed with a 12 label). This is less useful for
   * UIs, but is essential for Print diagrams.
   *
   *
   * Returns new text with the relevant replacements.
   *
   * @param {string} text The input text.
   * @param {function(string, string, string): string} fn A function that takes
   *    - Fullmatch, (Ex: Black 10)
   *    - Player (Ex: Black)
   *    - Label (ex: 10)
   * @return {string} processed text
   */
  replaceInline: function(text, fn) {
    if (!glift.flattener.labels.inlineLabelRegexGlobal_) {
      glift.flattener.labels.inlineLabelRegexGlobal_ = new RegExp(
          glift.flattener.labels.inlineLabelRegex.source, 'g');
    }
    var reg = glift.flattener.labels.inlineLabelRegexGlobal_;
    return text.replace(reg, function(full, player, label) {
      // Handle the case like 'Black (123)' so that we just pass the label and
      // not the (123)
      if (label.charAt(0) === '(' && label.charAt(label.length - 1) === ')') {
        label = label.substring(1, label.length - 1);
      }
      return fn(full, player, label);
    });
  },

  /**
   * Construct a label based on the collisions in the flattened object.
   * In the end, this will look something like
   *
   *  Black 10, White 13 and a.
   *
   * @param {!glift.flattener.Flattened} flattened
   * @return {string}
   */
  createCollisionLabel: function(flattened) {
    return glift.flattener.labels.labelFromCollisions(
        flattened.collisions());
  },

  /**
   * Construct the label based on the flattened object *and* the move numbers.
   * In the end, this will look something like
   *
   *    (Moves 1-3)
   *    Black 10, White 13 and a.
   *
   * Notes:
   *    - The move label is only generated when on the main path.
   *    - The collision label is only generated when there are collisions.
   *
   * @param {!glift.flattener.Flattened} flattened
   * @return {string}
   */
  createFullLabel: function(flattened) {
    return glift.flattener.labels.fullLabelFromCollisions(
        flattened.collisions(),
        flattened.isOnMainPath(),
        flattened.startingMoveNum(),
        flattened.endingMoveNum());
  },

  /**
   * @param {!Array<!glift.flattener.Collision>} collisions
   * @param {boolean} isOnMainPath
   * @param {number} startNum
   * @param {number} endNum
   * @return {string} the processed move label or an empty string if no label
   *    should be created.
   */
  fullLabelFromCollisions: function(collisions, isOnMainPath, startNum, endNum) {
    var label = ''
    if (isOnMainPath) {
      label += glift.flattener.labels.constructMoveLabel(startNum, endNum);
    }
    var col = glift.flattener.labels.labelFromCollisions(collisions);
    if (label && col) {
      // If both move label and the collision label is defined, join with a
      // newline.
      return label + '\n' + col;
    }
    return label + col;
  },

  /**
   * Create a move label. This is generally intended only for mainline
   * sequences, but can be used anywhere.
   *
   * @param {number} startNum
   * @param {number} endNum
   * @return {string} the processed move label or an empty string if it 
   */
  constructMoveLabel: function(startNum, endNum) {
    var baseLabel = '';
    // If we're on the mainline branch, construct a label that's like:
    // (Moves: 1-12)
    // or
    // (Move: 32)
    var nums = [startNum];
    if (startNum !== endNum) {
      // Note: Currently the API is such that if there's only one move, then
      // startNum == endNum.
      nums.push(endNum);
    }
    var moveLabel = nums.length > 1 ? 'Moves: ' : 'Move: ';
    baseLabel += '(' + moveLabel + nums.join('-') + ')';
    return baseLabel;
  },

  /**
   * Construct the collision label based on the flattened object. From the
   * flattened object, we must extract the collisions and the move numbers.
   *
   * @param {!Array<!glift.flattener.Collision>} collisions
   * @return {string} the processed collisions label.
   */
  labelFromCollisions: function(collisions) {
    var baseLabel = '';

    // No Collisions! Woohoo
    if (collisions == null || collisions.length === 0) {
      return baseLabel;
    }

    // First we collect all the labels by type, being careful to perserve the
    // ordering in which the labels came in.
    var labelToColArr = {};
    var labelToColStoneColor = {};
    var labelOrdering = [];
    for (var i = 0; i < collisions.length; i++) {
      var c = collisions[i];
      if (!labelToColArr[c.label]) {
        labelOrdering.push(c.label);
        labelToColArr[c.label] = [];
      }
      if (!labelToColStoneColor[c.label]) {
        labelToColStoneColor[c.label] = c.collisionStoneColor;
      }
      labelToColArr[c.label].push(c);
    }

    // Now we construct rows that look like:
    //
    // Black 13, White 16, Black 19 at White (a)
    // Black 14, White 17, Black 21 at Black 3
    /** @type {!Array<string>} */
    var allRows = []
    for (var k = 0; k < labelOrdering.length; k++) {
      var label = labelOrdering[k];
      var colArr = labelToColArr[label];
      var row = [];
      for (var i = 0; i < colArr.length; i++) {
        var c = colArr[i];
        var color = c.color === glift.enums.states.BLACK ? 'Black' : 'White';
        row.push(color + ' ' + c.mvnum);
      }
      var colStoneColor = labelToColStoneColor[label];
      colStoneColor = (colStoneColor === glift.enums.states.BLACK ?
          'Black' : 'White');

      // In the rare case where we construct labels, convert a to (a) so it can
      // be inline-rendered more easily. This has the downside that it makes
      // labels non-uniform, so we may eventually want to make all labels have
      // the form (<label>).
      if (/^[a-z]$/.test(label)) {
        label = '(' + label + ')';
      }
      var rowString = row.join(', ') + ' at ' + colStoneColor + ' ' + label;
      allRows.push(rowString);
    }
    if (baseLabel) { baseLabel += '\n'; }

    if (allRows.length >= 4) {
      // This means there are collisions at 4 separate locations, so to reduce
      // space, concerns, try to squash some of the lines together.  Note that
      // this is, usually pretty rare. It means that the user is generating
      // diagrams with lots of moves.
      allRows = glift.flattener.labels.compactifyLabels_(allRows);
    }

    baseLabel += allRows.join(',\n') + '.';
    return baseLabel;
  },

  /**
   * Compactify collision rows from _constructLabel. This is an uncommon
   * edgecase for the majority of diagrams; it means that there were captures +
   * plays at many locations.
   *
   * To preserve space, this method collapses labels that look like "Black 5 at
   * White 6\n, Black 7, White 10 at Black 3." into one line.
   *
   * @param {!Array<string>} collisionRows
   * @return {!Array<string>}
   */
  compactifyLabels_: function(collisionRows) {
    var out = [];
    var buffer = null;
    // Here we overload the usage of replaceInline to count the number labels in
    // a row.
    var numInlineLabels = function(row) {
      var count = 0;
      glift.flattener.labels.replaceInline(row, function(full, player, label) {
        count += 1;
        return full;
      });
      return count;
    };
    for (var i = 0; i < collisionRows.length; i++) {
      var row = collisionRows[i];
      var rowIsShort = true;
      var numLabels = numInlineLabels(row);
      // Note 2 labels is the minimum. Here, we arbitrarily decide that 3 labels
      // also counts as a short label.
      if (numLabels > 3) {
        rowIsShort = false;
      }
      if (!buffer && !rowIsShort) {
        out.push(row);
        buffer = null;
      } else if (!buffer && rowIsShort) {
        buffer = row;
      } else if (buffer && rowIsShort) {
        out.push(buffer + '; ' + row);
        buffer = null;
      } else if (buffer && !rowIsShort) {
        out.push(buffer);
        out.push(row);
        buffer = null;
      }
    }
    if (buffer) {
      // Flush any remaining buffer;
      out.push(buffer);
    }
    return out;
  }
};
