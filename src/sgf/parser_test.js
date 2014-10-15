glift.sgf.newParserTest = function() {
  module('glift.sgf.newParserTest');

  test('Parse simple, real problem', function() {
    var mt = glift.sgf.parse(testdata.sgfs.realproblem);
    ok(mt !== undefined, 'must not be undefined');
    var rp = mt.properties();
    ok(rp.getAllValues('GM') !== null, 'must find prop: GM');
    deepEqual(rp.getAllValues('GM'), ['1'], 'GM must be 1');
  });

  test('Parse problem with lots of properties, escaped bracket', function() {
    var mt = glift.sgf.parse(testdata.sgfs.marktest);
    var props = mt.properties();
    deepEqual(props.getOneValue('C'), '[Mark Test]');
  });

  test('Parse pass', function() {
    var sgf = '(;GM[1]C[It begins];B[]C[pass])';
    var mt = glift.sgf.parse(sgf);
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
    var mt = glift.sgf.parse(sgf);
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

    var mt = glift.sgf.parse(sgf);
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

    var mt = glift.sgf.parse(sgf);
    deepEqual(parseErrors.length, 2);
    ok(parseErrors[0].indexOf('Unknown property: MULTIGOGM') !== -1);
    ok(parseErrors[1].indexOf('[MULTIGOGM] is not valid') !== -1);
    glift.util.logz = oldLog;
  });

  test('Throw errors on bad syntax: no first paren', function() {
    var sgf = ';GM[1]'
    try {
      var mt = glift.sgf.parse(sgf);
    } catch (err) {
      ok(err.message.indexOf('Expected first non-whitespace char') !== -1);
    }
  });

  test('Throw errors on bad syntax: no first semicolon', function() {
    var sgf = '(GM[1])'
    try {
      var mt = glift.sgf.parse(sgf);
    } catch (err) {
      ok(err.message.indexOf('Expected char to be [;]') !== -1);
    }
  });

  test('Throw errors on bad syntax: whitespace in prop', function() {
    var sgf = '(;G M[1])'
    try {
      var mt = glift.sgf.parse(sgf);
    } catch (err) {
      ok(err.message.indexOf('Unexpected whitespace in property') !== -1);
    }
  });

  test('Throw errors on bad syntax: whitespace in prop', function() {
    var sgf = '(;G_[1])'
    try {
      var mt = glift.sgf.parse(sgf);
    } catch (err) {
      ok(err.message.indexOf('Unexpected character in property') !== -1);
    }
  });
};
