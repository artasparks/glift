(function() {
  module('glift.parse.parseTest');
  var fromFileName = glift.parse.fromFileName;
  var parseType = glift.parse.parseType;
  var sgfs = testdata.sgfs

  test('fromFileName', function() {
    var oldFromString = glift.parse.fromString;
    glift.parse.fromString = function(str, ttype) {
      return ttype;
    };

    deepEqual(fromFileName('z', 'foo.sgf'), parseType.SGF);
    deepEqual(fromFileName('z', 'foo.gib'), parseType.TYGEM);
    deepEqual(fromFileName('PANDANET', 'foo.sgf'), parseType.PANDANET);
    deepEqual(fromFileName('PANDANET', 'foo.gib'), parseType.TYGEM);
    deepEqual(fromFileName('z', 'foo.zed'), parseType.SGF);

    glift.parse.fromString = oldFromString;
  });

  test('from string: SGF, escaped comment', function() {
    var sgf = sgfs.escapedComment;
    var mt = glift.parse.fromString(sgf, parseType.SGF);
    ok(mt);
    ok(/Awesome!/.test(mt.properties().getComment()), 'should be awesome');
  });
})();
