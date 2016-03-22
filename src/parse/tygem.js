/**
 * The GIB format (i.e., Tygem's file format) is not public, so it's rather
 * difficult to know if this is truly an accurate parser. Oh well.
 *
 * Also, it's a horrible format. Also, this is a pretty hacky parser.
 *
 * @param {string} gibString
 * @retutrn {!glift.rules.MoveTree}
 * @package
 */
glift.parse.tygem = function(gibString) {
  var states = {
    HEADER: 1,
    BODY: 2
  };
  var colorToToken = { 1: 'B', 2: 'W' };

  var WHITE_NAME = 'GAMEWHITENAME';
  var BLACK_NAME = 'GAMEBLACKNAME';
  var KOMI = 'GAMECONDITION';

  var movetree = glift.rules.movetree.getInstance();
  var lines = gibString.split('\n');

  var grabHeaderProp = function(name, line, prop, mt) {
    line = line.substring(
        line.indexOf(name) + name.length + 1, line.length - 2);
    if (/\\$/.test(line)) {
      // This is a horrible hack. Sometimes \ appears as the last character
      line = line.substring(0, line.length - 1);
    }
    mt.properties().add(prop, line);
  };

  var curstate = states.HEADER;
  for (var i = 0, len = lines.length; i < len; i++) {
    var str = lines[i];
    var firstTwo = str.substring(0,2);
    if (firstTwo === '\\[') {
      // We're in the header.
      var eqIdx = str.indexOf('=');
      var type = str.substring(2, eqIdx);
      if (type === WHITE_NAME) {
        grabHeaderProp(WHITE_NAME, str, 'PW', movetree);
      } else if (type === BLACK_NAME) {
        grabHeaderProp(BLACK_NAME, str, 'PB', movetree);
      }
    } else if (firstTwo === 'ST') {
      if (curstate !== states.BODY) {
        // We're in stone-placing land and out of the header.
        curstate = states.BODY
      }

      // Stone lines look like:
      //     ? MoveNumber Color (1=B,2=W) x y
      // STO 0 2          2               15 15
      //
      // Note that the board is indexed from the bottom left rather than from
      // the upper left, as with SGFs. Also, the intersections are 0-indexed.
      var splat = str.split(" ");
      var colorToken = colorToToken[splat[3]];
      var x = parseInt(splat[4], 10);
      var y = parseInt(splat[5], 10);
      movetree.addNode().properties().add(
          colorToken, glift.util.point(x, y).toSgfCoord());
    }
  }
  return movetree.getTreeFromRoot();
};
