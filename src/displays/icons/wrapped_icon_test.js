(function() {
  module('glift.displays.icons.wrappedIconTest');
  var oneDec = function(val) {
    return Math.round(val * 10) / 10;
  };

  test('Constructor', function() {
    var wrapped = glift.displays.icons.wrappedIcon('undo')
    ok(wrapped !== undefined);
    ok(wrapped.originalBbox !== undefined);
  });

  test('Construct all icons', function() {
    for (var iconName in glift.displays.icons.svg) {
      var w = glift.displays.icons.wrappedIcon(iconName);
      deepEqual(iconName, w.iconName);
      ok(w.iconStr !== undefined);
      ok(w.originalBbox !== undefined);
    }
  });

  test('Transform', function() {
    var w = glift.displays.icons.wrappedIcon('play');
    w.performTransform({scale: 2});
    deepEqual(w.originalBbox.width() * 2 , w.bbox.width(), 'width transform');
    deepEqual(w.originalBbox.height() * 2 , w.bbox.height(), 'height transform');

    w = glift.displays.icons.wrappedIcon('play');
    w.performTransform({xMove: 10, yMove: 20});
    deepEqual(w.originalBbox.topLeft().x() + 10, w.bbox.topLeft().x());
    deepEqual(w.originalBbox.topLeft().y() + 20, w.bbox.topLeft().y());
  });

  test('Center cross within subbox with transform', function() {
    var wrapped = glift.displays.icons.wrappedIcon('multiopen');
    var subboxIcon = wrapped.setSubboxIcon('multiopen-boxonly')
    wrapped.performTransform({
      scale: 2,
      xMove: 10,
      yMove: 20
    });
    var centered = wrapped.centerWithinSubbox(
        glift.displays.icons.wrappedIcon('cross'), 0, 0);
    ok(wrapped != undefined);
    deepEqual(
      oneDec(centered.bbox.topLeft().x() - subboxIcon.bbox.topLeft().x()),
      oneDec(subboxIcon.bbox.botRight().x() - centered.bbox.botRight().x()),
      "Boxes should be x-centered");

    deepEqual(
      oneDec(subboxIcon.bbox.topLeft().y() - centered.bbox.topLeft().y()),
      oneDec(centered.bbox.botRight().y() - subboxIcon.bbox.botRight().y()),
      "Boxes should be y-centered");
  });

  test('Center cross within icon', function() {
    var wrapped = glift.displays.icons.wrappedIcon('multiopen');
    var centered = wrapped.centerWithinIcon(
        glift.displays.icons.wrappedIcon('cross'), 0, 0);
    ok(wrapped != undefined);
    deepEqual(
      oneDec(centered.bbox.topLeft().x() - wrapped.bbox.topLeft().x()),
      oneDec(wrapped.bbox.botRight().x() - centered.bbox.botRight().x()),
      "Boxes should be x-centered");

    deepEqual(
      oneDec(centered.bbox.topLeft().y() - wrapped.bbox.topLeft().y()),
      oneDec(wrapped.bbox.botRight().y() - centered.bbox.botRight().y()),
      "Boxes should be y-centered");
  });
})();
