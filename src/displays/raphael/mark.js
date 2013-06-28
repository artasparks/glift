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
glift.displays.raphael.mark = function(
    paper, type, coordinate, attr, spacing, label) {
  var c = coordinate;
  var obj;
  switch(type) {
    case "CIRCLE":
        obj = paper.text(c.x(), c.y(), 'CR');
        break;
    case "LABEL":
        obj = paper.text(c.x(), c.y(), label);
        break;
    case "SQUARE":
        obj = paper.text(c.x(), c.y(), 'SQ');
        break;
    case "TRIANGLE":
        obj = paper.text(c.x(), c.y(), 'TR');
        break;
    case "XMARK":
        obj = paper.text(c.x(), c.y(), 'MA');
        break;
    default: // do nothing
  }
  obj.attr(attr);
  return obj;
};
