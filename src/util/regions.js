goog.provide('glift.util.regions');

goog.require('glift.util');

glift.util.regions = {
  getComponents: function(boardRegion) {
    var br = glift.enums.boardRegions,
        out = {};
    if (boardRegion === br.TOP_LEFT) {
      out[br.TOP] = 1;
      out[br.LEFT] = 1;
    } else if (boardRegion === br.TOP_RIGHT) {
      out[br.TOP] = 1;
      out[br.RIGHT] = 1;
    } else if (boardRegion === br.BOTTOM_LEFT) {
      out[br.BOTTOM] = 1;
      out[br.LEFT] = 1;
    } else if (boardRegion === br.BOTTOM_RIGHT) {
      out[br.BOTTOM] = 1;
      out[br.RIGHT] = 1;
    } else if (boardRegion == br.TOP) {
      out[br.TOP] = 1;
    } else if (boardRegion == br.BOTTOM) {
      out[br.BOTTOM] = 1;
    } else if (boardRegion == br.LEFT) {
      out[br.LEFT] = 1;
    } else if (boardRegion == br.RIGHT) {
      out[br.RIGHT] = 1;
    }
    return out;
  }
};
