(function() {
  module('glift.displays.boardPointsTest');
  var maxInts = 19;
  var cropboxAll = glift.displays.cropbox.getFromRegion(
      glift.enums.boardRegions.ALL, maxInts);
  var fullBbox = glift.displays.bbox.fromPts(
      glift.util.point(0, 0),
      glift.util.point(300, 300));
  var fakeLineBox = new glift.displays._LineBox(fullBbox, 20, cropboxAll);

  test('Should construct', function() {
    var bpz = glift.displays.boardPoints(fakeLineBox, maxInts, false);
    ok(bpz !== null);
  });
})();
