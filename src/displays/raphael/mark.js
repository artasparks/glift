/**
 * Create a raphael Mark object.  Marks are simple raphael objects.
 *
 * The types are given in glift.enums.marks, but are mentioned here for
 * convenience:
 *  CIRCLE: "CIRCLE",
 *  LABEL: "LABEL",
 *  SQUARE: "SQUARE",
 *  XMARK: "XMARK",
 *  TRIANGLE: "TRIANGLE",
 */
glift.displays.raphael.mark = function(paper, type, coordinate, attr, spacing) {
  var c = coordinate;
  switch(type) {
    case "CIRCLE":
        return paper.text(c.x(), c.y(), 'CR');
    case "LETTER":
        return paper.text(c.x(), c.y(), 'LB');
    case "SQUARE":
        return paper.text(c.x(), c.y(), 'SQ');
    case "TRIANGLE":
        return paper.text(c.x(), c.y(), 'TR');
    case "XMARK":
        return paper.text(c.x(), c.y(), 'MA');
    default: // do nothing
  }
};
