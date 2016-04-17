(function() {
  module('glift.parse.sgfTest');

  test('Parse simple, real problem', function() {
    var mt = glift.parse.sgf(testdata.sgfs.realproblem);
    ok(mt !== undefined, 'must not be undefined');
    var rp = mt.properties();
    ok(rp.getAllValues('GM') !== null, 'must find prop: GM');
    deepEqual(rp.getAllValues('GM'), ['1'], 'GM must be 1');
  });

  test('Parse problem with lots of properties, escaped bracket', function() {
    var mt = glift.parse.sgf(testdata.sgfs.marktest);
    var props = mt.properties();
    deepEqual(props.getOneValue('C'), '[Mark Test]');
  });

  test('Another escaped bracket test', function() {
    var mt = glift.parse.sgf('(;GM[1]C[Kashomon [1k\\]])');
    var props = mt.properties();
    deepEqual(props.getOneValue('C'), 'Kashomon [1k]');
  });

  test('Pre-process point rectangle', function() {
    var mt = glift.parse.sgf('(;GM[1]AW[aa:bb])');
    var props = mt.properties();
    deepEqual(props.getAllValues('AW'), ['aa', 'ba', 'ab', 'bb']);
  });

  test('Parse pass', function() {
    var sgf = '(;GM[1]C[It begins];B[]C[pass])';
    var mt = glift.parse.sgf(sgf);
    ok(mt !== undefined);
    var rp = mt.properties();
    deepEqual(rp.getAllValues('GM'), ['1']);
    deepEqual(rp.getAllValues('C'), ['It begins']);
    mt.moveDown();
    var rp = mt.properties();
    deepEqual(rp.getAllValues('B'), ['']);
    deepEqual(rp.getAllValues('C'), ['pass']);
  });

  test('Parse warning on unknown props', function() {
    var oldLog = glift.util.logz;
    var parseErrors = [];
    var testLogger = function(msg) {
      parseErrors.push(msg);
    };
    // Patch in a testing logger.
    glift.util.logz = testLogger;

    var sgf = '(;GM[1]C[It begins]ZZ[zz]Z[1];B[]C[pass])';
    var mt = glift.parse.sgf(sgf);
    deepEqual(parseErrors.length, 4);
    ok(parseErrors[0].indexOf('Parsing Warning') !== -1,
        'Actual msg: ' + parseErrors[0]);
    ok(parseErrors[1].indexOf('The property [ZZ] is not valid') !== -1,
        'Actual msg: ' + parseErrors[1]);

    ok(parseErrors[2].indexOf('Parsing Warning') !== -1,
        'Actual msg: ' + parseErrors[2]);
    ok(parseErrors[3].indexOf('The property [Z] is not valid') !== -1,
        'Actual msg: ' + parseErrors[3]);

    // reset the logger
    glift.util.logz = oldLog;
  });

  test('Produce warnings on end-of-sgf garbage.', function() {
    var oldLog = glift.util.logz;
    var parseErrors = [];
    var sgf = '(;GB[1]C[Foo])C[Foo])'
    var testLogger = function(msg) {
      parseErrors.push(msg);
    };
    glift.util.logz = testLogger;

    var mt = glift.parse.sgf(sgf);
    deepEqual(parseErrors.length, 7);
    ok(parseErrors[0].indexOf('Garbage after finishing the SGF.') !== -1);

    glift.util.logz = oldLog;
  });


  test('Produce warnings on too-long-properties.', function() {
    var oldLog = glift.util.logz;
    var parseErrors = [];
    var sgf = '(;GB[1]C[Foo]MULTIGOGM[1])';
    var testLogger = function(msg) {
      parseErrors.push(msg);
    };
    glift.util.logz = testLogger;

    var mt = glift.parse.sgf(sgf);
    deepEqual(parseErrors.length, 2);
    ok(parseErrors[0].indexOf('Unknown property: MULTIGOGM') !== -1);
    ok(parseErrors[1].indexOf('[MULTIGOGM] is not valid') !== -1);
    glift.util.logz = oldLog;
  });

  test('Throw errors on bad syntax: no first paren', function() {
    var sgf = ';GM[1]'
    try {
      var mt = glift.parse.sgf(sgf);
    } catch (err) {
      ok(err.message.indexOf('Expected first non-whitespace char') !== -1);
    }
  });

  test('Throw errors on bad syntax: no first semicolon', function() {
    var sgf = '(GM[1])'
    try {
      var mt = glift.parse.sgf(sgf);
    } catch (err) {
      ok(err.message.indexOf('Expected char to be [;]') !== -1);
    }
  });

  test('Throw errors on bad syntax: whitespace in prop', function() {
    var sgf = '(;G M[1])'
    try {
      var mt = glift.parse.sgf(sgf);
    } catch (err) {
      ok(err.message.indexOf('Unexpected whitespace in property') !== -1);
    }
  });

  test('Throw errors on bad syntax: underscore in prop', function() {
    var sgf = '(;G_[1])'
    try {
      var mt = glift.parse.sgf(sgf);
    } catch (err) {
      ok(err.message.indexOf('Unexpected character in property') !== -1);
    }
  });

  test('Process Metadata at root', function() {
    var oldval = glift.parse.sgfMetadataProperty;
    glift.parse.sgfMetadataProperty = 'GC';

    var expected = {foo: 'bar'};

    var sgf = '(;GM[1]' +
        glift.parse.sgfMetadataProperty +
        '[' + JSON.stringify(expected) + '])';

    var mt = glift.parse.sgf(sgf);
    deepEqual(mt.metadata(), expected);

    glift.parse.sgfMetadataProperty = oldval;
  });

  test('Process Metadata at root', function() {
    var oldval = glift.parse.sgfMetadataProperty;
    glift.parse.sgfMetadataProperty = 'GC';

    var expected = {foo: 'bar'};

    var sgf = '(;GM[1]' +
        glift.parse.sgfMetadataProperty +
        '[' + JSON.stringify(expected) + '])';

    var mt = glift.parse.sgf(sgf);
    deepEqual(mt.metadata(), expected);
    glift.parse.sgfMetadataProperty = oldval;
  });

  test('Fail to process Metadata at root: bad JSON', function() {
    var oldval = glift.parse.sgfMetadataProperty;
    glift.parse.sgfMetadataProperty = 'GC';

    var oldLog = glift.util.logz;
    var parseErrors = [];
    var testLogger = function(msg) {
      parseErrors.push(msg);
    };

    // Patch in a testing logger.
    glift.util.logz = testLogger;
    var sgf = '(;GM[1]' + glift.parse.sgfMetadataProperty + '[foo: bar])';
    var mt = glift.parse.sgf(sgf);

    deepEqual(parseErrors.length, 1);
    ok(/Tried to parse property GC/.test(parseErrors[0]),
        'Regex does not match: ' + parseErrors[0]);

    deepEqual(mt.properties().getOneValue('GC'), 'foo: bar',
        'Should still record value in prop data.');

    glift.parse.sgfMetadataProperty = oldval;
    glift.util.logz = oldLog;
  });

  test('Ignore metadata: not at root', function() {
    var oldval = glift.parse.sgfMetadataProperty;
    glift.parse.sgfMetadataProperty = 'GC';

    var sgf = '(;GM[1];' + glift.parse.sgfMetadataProperty + '[foo: bar])';
    var mt = glift.parse.sgf(sgf);
    deepEqual(mt.metadata(), null);

    glift.parse.sgfMetadataProperty = oldval;
  });

  test('Rectangles of stones', function() {
    var sgf = '(;GM[1]AB[pb:sb][oc][sc][nd][oe:pe]AW[pa:qa]' +
        '[nb:ob][mc:me][qc:rc][re][nf][pf:pg][rg];B[rd]GB[])'
    var mt = glift.parse.sgf(sgf);
    var wstones = mt.properties().getAllValues('AW');
    var smap = {};
    for (var i = 0; i < wstones.length; i++) {
      smap[wstones[i]] = true;
    }
    ok(smap['nb'], 'nb stone');
    ok(smap['ob'], 'ob stone');
  });

  test('Parse Tygem', function() {
    var mt = glift.parse.fromString(testdata.gib.tygemExampleNewer, 'TYGEM');
    deepEqual(mt.properties().getOneValue('PW'), 'Zellnox (2D)');
    deepEqual(mt.properties().getOneValue('PB'), 'pdy1800 (1D)');
  });
})();
