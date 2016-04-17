goog.scope(function() {

/**
 * Metadata Start and End tags allow us to insert metadata directly, as
 * JSON, into SGF comments.  It will not be display by glift (although it
 * will by other editors, of course). It's primary use is as an API for
 * embedding tertiary data.
 *
 * It is currently expected that this property is attached to the root node.
 *
 * Some other notes:
 *  - Metadata extraction happens in the parser.
 *  - If the metadataProperty field is set, it will grab all the data from
 *  the relevant property and try to convert it to JSON.
 *
 * To disable this behavior, set metadataProperty to null.
 *
 * api:experimental
 */
glift.parse.sgfMetadataProperty = 'GC';


/**
 * Escapes some text by converting ] to \\]
 * @param {string} text
 * @return {string}
 */
glift.parse.sgfEscape = function(text) {
  return text.toString().replace(/]/g, '\\]');
};

/**
 * Unescapes some text by converting \\] to ]
 * @param {string} text
 * @return {string}
 */
glift.parse.sgfUnescape = function(text) {
  return text.toString().replace(/\\]/g, ']');
};

var states = {
  BEGINNING_BEFORE_PAREN: 0,
  BEGINNING: 1,
  PROPERTY: 2, // e.g., 'AB[oe]' or 'A_B[oe]' or 'AB_[oe]'
  PROP_DATA: 3, // 'AB[o_e]'
  BETWEEN: 4, // 'AB[oe]_', '_AB[oe]'
  FINISHED_SGF: 5
};

var statesToString = {
  0: 'BEGINNING_BEFORE_PAREN',
  1: 'BEGINNING',
  2: 'PROPERTY',
  3: 'PROP_DATA',
  4: 'BETWEEN',
  5: 'FINISHED_SGF'
};

var syn = {
  LBRACE:  '[',
  RBRACE:  ']',
  LPAREN:  '(',
  RPAREN:  ')',
  SCOLON:  ';'
};

var wsRegex = /\s|\n/;
var propRegex = /[A-Z]/;
var oldStyleProp = /[a-z]/;
var pointRectangleRegex = /^[a-z][a-z]:[a-z][a-z]$/;

/**
 * The new Glift SGF parser!
 * Takes a string, returns a movetree.  Easy =).
 *
 * Note: Because SGFs have notoriously bad data / properties, we log warnings
 * for unknown properties rather than throwing errors.
 *
 * @param {string} sgfString
 * @return {!glift.rules.MoveTree}
 * @package
 */
glift.parse.sgf = function(sgfString) {
  var curstate = states.BEGINNING_BEFORE_PAREN;
  var movetree = glift.rules.movetree.getInstance();
  var charBuffer = ''; // List of characters.
  var propData = []; // List of Strings.
  var branchMoveNums = []; // used for when we pop up.
  var curProp = '';
  var curchar = '';
  var lineNum = 0;
  var colNum = 0;
  // We track how many parens we've seen, so we know when we've finished the
  // SGF.
  var parenDepth = 0;

  // A simple boolean to track whether property data could be considered a point
  // rectangle (by the existence of :). Processing point rectangles is
  // relatively costly, so we try to be conservative about point-rectangle
  // processing.
  var possiblePointRectangle = false;

  var perror = function(msg) {
    glift.parse.sgfParseError(lineNum, colNum, curchar, msg, false /* iswarn */);
  };

  var pwarn = function(msg) {
    glift.parse.sgfParseError(lineNum, colNum, curchar, msg, true /* iswarn */);
  };

  var flushCharBuffer = function() {
    var strOut = charBuffer;
    charBuffer = '';
    return strOut;
  };

  /** Flush the property data to the movetree's properties. */
  var flushPropDataIfNecessary = function() {
    if (curProp.length > 0) {
      if (glift.parse.sgfMetadataProperty &&
          curProp === glift.parse.sgfMetadataProperty &&
          !movetree.node().getParent()) {
        try {
          var pdata = propData[0].replace(/\\]/g, ']');
          var mdata = JSON.parse(pdata);
          if (glift.util.typeOf(mdata) === 'object') {
            movetree.setMetdata(/** @type {!Object} */ (mdata));
          }
        } catch (e) {
          glift.util.logz('Tried to parse property ' + curProp
              + ' as Glift SGF JSON-metadata, but unable to parse:' +
              + pdata );
        }
      }
      movetree.properties().add(curProp, propData);
      propData = [];
      curProp = '';
    }
  };

  /**
   * Flush characters to the prop data. All relevant property process occurs
   * here. In particular, this is where we process point rectangles.
   */
  var flushCharBufferToPropData = function() {
    var charz = flushCharBuffer();
    if (possiblePointRectangle &&
        pointRectangleRegex.test(charz) &&
        (curProp === 'AB' || curProp === 'AW' || curProp === 'AE' || 
            curProp === 'CR' || curProp === 'DD' ||
            curProp === 'MA' || curProp === 'SL' ||
            curProp === 'SQ' || curProp === 'TR')) {
      var pts = glift.util.pointArrFromSgfProp(charz);
      for (var j = 0; j < pts.length; j++) {
        propData.push(pts[j].toSgfCoord());
      }
    } else {
      propData.push(charz);
    }
    possiblePointRectangle = false;
  };

  // Run everything inside an anonymous function so we can use 'return' as a
  // fullstop break.
  (function() {
    for (var i = 0; i < sgfString.length; i++) {
      colNum++; // This means that columns are 1 indexed.
      curchar = sgfString.charAt(i);

      if (curchar === "\n" ) {
        lineNum++;
        colNum = 0;
        if (curstate !== states.PROP_DATA) {
          continue;
        }
      }

      switch (curstate) {
        case states.BEGINNING_BEFORE_PAREN:
          if (curchar === syn.LPAREN) {
            branchMoveNums.push(movetree.node().getNodeNum()); // Should Be 0.
            parenDepth++;
            curstate = states.BEGINNING;
          } else if (wsRegex.test(curchar)) {
            // We can ignore whitespace.
          } else {
            perror('Unexpected character. ' +
              'Expected first non-whitespace char to be [(]');
          }
          break;
        case states.BEGINNING:
          if (curchar === syn.SCOLON) {
            curstate = states.BETWEEN; // The SGF Begins!
          } else if (wsRegex.test(curchar)) {
            // We can ignore whitespace.
          } else {
            perror('Unexpected character. Expected char to be [;]');
          }
          break;
        case states.PROPERTY:
          if (propRegex.test(curchar)) {
            charBuffer += curchar;
            // In the SGF Specification, SGF properties can be of arbitrary
            // lengths, even though all standard SGF properties are 1-2 chars.
          } else if (oldStyleProp.test(curchar)) {
            // Do nothing. This is an FF1 - FF3 style property. For
            // compatibility, we just ignore it and move on.
          } else if (curchar === syn.LBRACE) {
            curProp = flushCharBuffer();
            if (glift.rules.prop[curProp] === undefined) {
              pwarn('Unknown property: ' + curProp);
            }
            curstate = states.PROP_DATA;
          } else if (wsRegex.test(curchar)) {
            // Should whitespace be allowed here?
            perror('Unexpected whitespace in property name')
          } else {
            perror('Unexpected character in property name');
          }
          break;
        case states.PROP_DATA:
          if (curchar === syn.RBRACE
              && charBuffer.charAt(charBuffer.length - 1) === '\\') {
            // Remove the \
            charBuffer = charBuffer.substring(0, charBuffer.length - 1);
            // And add the brace as a normal character
            charBuffer += curchar;
          } else if (curchar === syn.RBRACE) {
            flushCharBufferToPropData();
            curstate = states.BETWEEN;
          } else {
            if (curchar === ':') {
              possiblePointRectangle = true;
            }
            charBuffer += curchar;
          }
          break;
        case states.BETWEEN:
          if (propRegex.test(curchar)) {
            flushPropDataIfNecessary();
            charBuffer += curchar;
            curstate = states.PROPERTY;
          } else if (curchar === syn.LBRACE) {
            if (curProp.length > 0) {
              curstate = states.PROP_DATA; // more data to process
            } else {
              perror('Unexpected token.  Orphan property data.');
            }
          } else if (curchar === syn.LPAREN) {
            parenDepth++;
            flushPropDataIfNecessary();
            branchMoveNums.push(movetree.node().getNodeNum());
          } else if (curchar === syn.RPAREN) {
            parenDepth--;
            flushPropDataIfNecessary();
            if (branchMoveNums.length === 0) {
              while (movetree.node().getNodeNum() !== 0) {
                movetree.moveUp();
              }
              return movetree;
            }
            var parentBranchNum = branchMoveNums.pop();
            while (movetree.node().getNodeNum() !== parentBranchNum) {
              movetree.moveUp();
            }
            if (parenDepth === 0) {
              // We've finished the SGF.
              curstate = states.FINISHED_SGF;
            }
          } else if (curchar === syn.SCOLON) {
            flushPropDataIfNecessary();
            movetree.addNode();
          } else if (wsRegex.test(curchar)) {
            // Do nothing.  Whitespace can be ignored here.
          } else {
            perror('Unknown token');
          }
          break;
        case states.FINISHED_SGF:
          if (wsRegex.test(curchar)) {
            // Do nothing.  Whitespace can be ignored here.
          } else {
            pwarn('Garbage after finishing the SGF.');
          }
          break;
        default:
          perror('Fatal Error: Unknown State!'); // Shouldn't get here.
      }
    }
    if (movetree.node().getNodeNum() !== 0) {
      perror('Expected to end up at start.');
    }
  })();
  return movetree;
};

/**
 * Throw a parser error or log a parse warning.  The message is optional.
 * @param {number} lineNum
 * @param {number} colNum
 * @param {string} curchar
 * @param {string} message
 * @param {boolean} isWarning
 * @package
 */
glift.parse.sgfParseError = function(lineNum, colNum, curchar, message, isWarning) {
  var header = 'SGF Parsing ' + (isWarning ? 'Warning' : 'Error');
  var err = header + ': At line [' + lineNum + '], column [' + colNum
      + '], char [' + curchar + '], ' + message;
  if (isWarning) {
    glift.util.logz(err);
  } else {
    throw new Error(err);
  }
};

});
