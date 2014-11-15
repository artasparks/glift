glift.parse.parseTest = function() {
  module('glift.parse.parseTest');
  var fromFileName = glift.parse.fromFileName;
  var parseType = glift.parse.parseType;

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
};
