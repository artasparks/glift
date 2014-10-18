glift.rules.treepathNextmovesTest = function() {
  module('glift.rules.treepathNextmovesTest');
  var findNextMoves = glift.rules.treepath.findNextMovesPath;
  var applyNextMoves = glift.rules.treepath.applyNextMoves;
  var point = glift.util.point;
  var sgfpoint = glift.util.pointFromSgfCoord;

  // 6 moves.
  var simpleGame = '(;GM[1];B[aa];W[ab];B[ac];W[ad];B[ae];W[af])';

  // 6 moves + 2-4 move variations.
  var gameVariation = '(;GM[1];B[aa];W[ab];B[ac];W[ad];B[ae];W[af]' +
    '(;B[ag];W[ah];B[ai];W[aj])' + // variation 1 (mainline
    '(;B[ah];W[ai];B[aj];W[ak]))'; // variation 2

  test('Test init setup', function() {
    var mt = glift.rules.movetree.getFromSgf(simpleGame);
    var out = findNextMoves(mt, []);
    deepEqual(out.treepath, []);
    deepEqual(out.nextMoves, []);
  });

  test('Test simplecase', function() {
    var mt = glift.rules.movetree.getFromSgf(
        '(;GM[1]AW[aa];B[ab];W[bbr])', [0]);
    var out = findNextMoves(mt);
    deepEqual(out.treepath, []);
    deepEqual(out.nextMoves, [0]);
  });

  test('Test basic nextmoves', function() {
    var mt = glift.rules.movetree.getFromSgf(simpleGame);
    var out = findNextMoves(mt, [0,0,0]); // 3 moves in.
    deepEqual(out.treepath, []);
    deepEqual(out.nextMoves, [0,0,0]);
  });

  test('Test nextmoves with override', function() {
    var mt = glift.rules.movetree.getFromSgf(simpleGame);
    var out = findNextMoves(mt, [0,0,0], 1);
    deepEqual(out.treepath, [0, 0]);
    deepEqual(out.nextMoves, [0]);
  });

  test('Test nextmoves. Variation -- mainline', function() {
    var mt = glift.rules.movetree.getFromSgf(gameVariation);
    var out = findNextMoves(mt, [0,0,0,0,0,0,0]);
    deepEqual(out.treepath, []);
    deepEqual(out.nextMoves, [0,0,0,0,0,0,0]);
  });

  test('Test nextmoves. Variation -- sideline', function() {
    var mt = glift.rules.movetree.getFromSgf(gameVariation);
    var out = findNextMoves(mt, [0,0,0,0,0,0,1,0]);
    deepEqual(out.treepath, [0,0,0,0,0,0]);
    deepEqual(out.nextMoves, [1,0]);
  });

  test('Test nextmoves. Variation -- sideline + minusMoves', function() {
    var mt = glift.rules.movetree.getFromSgf(gameVariation);
    var out = findNextMoves(mt, [0,0,0,0,0,0,1,0], 20);
    deepEqual(out.treepath, []);
    deepEqual(out.nextMoves, [0,0,0,0,0,0,1,0]);
  });

  test('Test nextmoves. Variation -- sideline.  No initPos', function() {
    var initPos = [0,0,0,0,0,0,1,0];
    var mt = glift.rules.movetree.getFromSgf(gameVariation, initPos);
    var out = findNextMoves(mt);
    deepEqual(out.treepath, [0,0,0,0,0,0]);
    deepEqual(out.nextMoves, [1,0]);
  });

  // 6 moves + 2-4 move variations.
  var gameVariation2 = "(;GM[1];B[aa];W[ab];B[ac];W[ad];B[ae];W[af]" +
    "(;B[ag];W[ah];B[ai];W[aj])" + // variation 1 (mainline
    "(;B[ah]C[Biff];W[ai];B[aj]C[Baff];W[ak]))"; // variation 2

  test('Test nextmoves. Comments', function() {
    var initPos = [0,0,0,0,0,0,1,0,0];
    var mt = glift.rules.movetree.getFromSgf(gameVariation2, initPos);
    var out = findNextMoves(mt);
    deepEqual(out.treepath, [0,0,0,0,0,0,1]);
    deepEqual(out.nextMoves, [0,0]);
  });

  ////////////////////////////////
  /////// Apply Next Moves ///////
  ////////////////////////////////

  test('Apply next moves -- no collisions', function() {
    var initPos = [0,0,0,0,0,0];
    var nextMoves = [1,0];
    var mt = glift.rules.movetree.getFromSgf(gameVariation, initPos);
    var goban = glift.rules.goban.getFromMoveTree(mt).goban
    var out = applyNextMoves(mt, goban, nextMoves);
    deepEqual(out.stones, [
        { point: sgfpoint('ah'), color: 'BLACK'},
        { point: sgfpoint('ai'), color: 'WHITE'}]);
  });

  test('Apply next moves: Comments', function() {
    var initPos = [0,0,0,0,0,0,1];
    var nextMoves = [0,0];
    var mt = glift.rules.movetree.getFromSgf(gameVariation2, initPos);
    var goban = glift.rules.goban.getFromMoveTree(mt).goban
    var out = applyNextMoves(mt, goban, nextMoves);
    deepEqual(out.stones, [
        { point: sgfpoint('ai'), color: 'WHITE'},
        { point: sgfpoint('aj'), color: 'BLACK'}]);
  });

  // Capture variation
  // Note: capturing happens on move 7 (1 indexed) and there are 8 moves.
  var captureVariation = '(;GM[1];B[aa];W[ab];B[ad];W[ac];B[bb];W[ae]' +
    ';B[bc];W[ac]C[Foo])';

  test('Apply next moves -- go board collision', function() {
    var initPos = [0,0,0,0,0];
    var nextMoves = [0,0,0];
    var mt = glift.rules.movetree.getFromSgf(captureVariation, initPos);
    var goban = glift.rules.goban.getFromMoveTree(mt).goban
    var out = applyNextMoves(mt, goban, nextMoves);
    deepEqual(out.stones, [
        { point: sgfpoint('ae'), color: 'WHITE'},
        { point: sgfpoint('bc'), color: 'BLACK'},
        { point: sgfpoint('ac'), color: 'WHITE', collision: null}]);
    deepEqual(out.movetree.properties().getOneValue('C'), 'Foo');
  });

  test('Apply next moves -- next moves collision', function() {
    var initPos = [0,0,0];
    var nextMoves = [0,0,0,0,0];
    var mt = glift.rules.movetree.getFromSgf(captureVariation, initPos);
    var goban = glift.rules.goban.getFromMoveTree(mt).goban
    var out = applyNextMoves(mt, goban, nextMoves);
    deepEqual(out.stones, [
        { point: sgfpoint('ac'), color: 'WHITE'},
        { point: sgfpoint('bb'), color: 'BLACK'},
        { point: sgfpoint('ae'), color: 'WHITE'},
        { point: sgfpoint('bc'), color: 'BLACK'},
        { point: sgfpoint('ac'), color: 'WHITE', collision: 0}]);
  });
};
