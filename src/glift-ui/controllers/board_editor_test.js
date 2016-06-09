(function() {
  module('glift.controllers.boardEditorTest');
  var sgfs = testdata.sgfs;
  var boardEditor = glift.controllers.boardEditor;

  test("Basic Creation", function() {
    var be = boardEditor({})
    ok(be !== undefined);
  });

  test("Extra option initialization", function() {
    var be = boardEditor({});
    ok(be._alphaLabels.length, 26);
    ok(be._numericLabels.length, 100);

    deepEqual(be._alphaLabels.slice(-3), ['C', 'B', 'A']);
    deepEqual(be._numericLabels.slice(-3), [3, 2, 1]);
  });

  test("SGF with labels removes available labels", function() {
    var marks = glift.enums.marks;
    var point = glift.util.point;
    var be = boardEditor({
        sgfString: '(;LB[aa:A][ab:B][ac:1][ad:3][ae:c]TR[dd]MA[de])'
    });
    ok(be._numericLabels.length, 98);
    ok(be._alphaLabels.length, 24);
    deepEqual(be._alphaLabels.slice(-3), ['E', 'D', 'C']);
    deepEqual(be._numericLabels.slice(-3), [5, 4, 2]);
    deepEqual(be.currentAlphaMark(), 'C');
    deepEqual(be.currentNumericMark(), '2');

    deepEqual(be.getMark(point(5,5)), null);
    deepEqual(be.getMark(point(3,3)), {mark: marks.TRIANGLE});
    deepEqual(be.getMark(point(3,4)), {mark: marks.XMARK});
    deepEqual(be.getMark(point(0,0)), {mark: marks.LABEL_ALPHA, data: 'A'});
    deepEqual(be.getMark(point(0,2)), {mark: marks.LABEL_NUMERIC, data: '1'});
  });

  test("Add and Remove", function() {
    var marks = glift.enums.marks;
    var point = glift.util.point;
    var be = boardEditor({ sgfString: '(;LB[aa:A])' });
    deepEqual(be.getMark(point(0, 0)), {mark: marks.LABEL_ALPHA, data: 'A'});
    deepEqual(be.movetree.properties().getAllValues('LB'), ['aa:A']);

    be.addMark(point(0, 1), marks.LABEL_ALPHA);
    deepEqual(be.getMark(point(0, 1)), {mark: marks.LABEL_ALPHA, data: 'B'});
    deepEqual(be.movetree.properties().getAllValues('LB'), ['aa:A', 'ab:B']);

    be.addMark(point(1, 0), marks.LABEL_NUMERIC);
    deepEqual(be.getMark(point(1, 0)), {mark: marks.LABEL_NUMERIC, data: '1'});
    deepEqual(be.movetree.properties().getAllValues('LB'),
        ['aa:A', 'ab:B', 'ba:1']);

    be.addMark(point(1, 1), marks.LABEL_NUMERIC);
    deepEqual(be.getMark(point(1, 1)), {mark: marks.LABEL_NUMERIC, data: '2'});
    deepEqual(be.movetree.properties().getAllValues('LB'),
        ['aa:A', 'ab:B', 'ba:1', 'bb:2']);

    // Remove numeric mark.
    be.addMark(point(1, 0), marks.LABEL_NUMERIC);
    deepEqual(be.getMark(point(1, 0)), null);
    deepEqual(be._numericLabels[be._numericLabels.length - 1], 1);
    deepEqual(be.movetree.properties().getAllValues('LB'),
        ['aa:A', 'ab:B', 'bb:2']);

    // Remove alphabetic mark.
    be.addMark(point(0, 0), marks.LABEL_ALPHA);
    deepEqual(be.getMark(point(1, 0)), null);
    deepEqual(be._alphaLabels[be._alphaLabels.length - 1], 'A');
    deepEqual(be.movetree.properties().getAllValues('LB'), ['ab:B', 'bb:2']);
  });

  test("Add placement; test captures", function() {
    var marks = glift.enums.marks;
    var BLACK = glift.enums.states.BLACK;
    var WHITE = glift.enums.states.WHITE;
    var point = glift.util.point;
    var be = boardEditor({ sgfString: '(;LB[aa:A])' });
    be.addPlacement(point(0,2), BLACK);
    deepEqual(be.movetree.properties().getAllValues('AB'), ['ac']);

    // test capture
    be.addPlacement(point(0,1), WHITE);
    be.addPlacement(point(1,2), WHITE);
    be.addPlacement(point(0,3), WHITE);
    deepEqual(be.movetree.properties().getAllValues('AW'), ['ab', 'bc', 'ad']);
    deepEqual(be.movetree.properties().getAllValues('AB'), []);
  });
})();
