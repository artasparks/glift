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

  test('Known parse type', function() {
    ok(glift.parse.knownGoFile('foo-aoeu.sgf'))
    ok(glift.parse.knownGoFile('zog.gib'))
    ok(!glift.parse.knownGoFile());
    ok(!glift.parse.knownGoFile(1234));
    ok(!glift.parse.knownGoFile('foo-aoeu.aoeu'));
  });

  test('Parse type from filename', function() {
    deepEqual(glift.parse.parseTypeFromFilename('foo.gib'), 'TYGEM');
    deepEqual(glift.parse.parseTypeFromFilename('foo.sgf'), 'SGF');
    deepEqual(glift.parse.parseTypeFromFilename('foo.zorg'), 'SGF');
  });
})();
