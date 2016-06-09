(function() {
  module('glift.parse.parseTest');
  var fromFileName = glift.parse.fromFileName;
  var parseType = glift.parse.parseType;
  var sgfs = testdata.sgfs

  test('fromFileName', function() {
    ok(fromFileName('(;GB[1])', 'foo.sgf'), parseType.SGF);
    ok(fromFileName('(;GB[1]CoPyright[PANDANET])', 'foo.sgf'), parseType.SGF);
    ok(fromFileName('STO 0 6 1 2 14 ', 'foo.gib'));
  });

  test('from string: SGF, escaped comment', function() {
    var sgf = sgfs.escapedComment;
    var mt = glift.parse.fromString(sgf, parseType.SGF);
    ok(mt);
    ok(/Awesome!/.test(mt.properties().getComment()), 'should be awesome');
  });
})();
