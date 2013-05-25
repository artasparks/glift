/**
 * The bridge is the only place where display and rules+controller code can
 * mingle.
 */
glift.bridge = {
  /**
   * Set/create the various components in the UI.
   *
   * For a more detailed discussion, see intersections in glift.rules.
   */
  setDisplayState: function(intersectionData, display) {
    var marks = glift.enums.marks;
    for (var ptHash in intersectionData.points) {
      var intersection = intersectionData.points[ptHash];
      if (marks.STONE in intersection) {
        var color = intersection[marks.STONE];
        var pt = intersection.point;
        display.setColor(pt, color);
      }
    }
  }
};
