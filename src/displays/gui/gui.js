/**
 * Extra GUI methods and data.
 */
glift.displays.gui = {
  /**
   * Get an ID for a SVG element (return the stringForm id).
   *
   * extraData may be undefined.  Usually a point, but also be an icon name.
   */
  elementId: function(divId, type, extraData) {
    var base = divId + "_" + type;
    if (extraData !== undefined) {
      if (extraData.x !== undefined) {
        return base + '_' + extraData.x() + "_" + extraData.y();
      } else {
        return base + '_' + extraData.toString();
      }
    } else {
      return base;
    }
  },

  /**
   * Take a div, create multiple sub divs, absolutely positioned.
   *
   * divId: divId to be split.
   * percents: Precent tall that each section is.  Note that the length of this
   * == the number of splits - 1;
   *
   * direction: defaults to horizontal.  Also can split vertically
   *
   * Note:
   *  X => XX (vertical split)
   *
   *  X => X  (horizontal split)
   *       X
   *
   * return: the ids for the top div and bottom div.
   */
  splitDiv: function(divId, percents, direction) {
    var bbox = glift.displays.bboxFromDiv(divId),
        totalPercent = 0;
    if (!direction) {
      direction = 'horizontal';
    } else if (direction !== 'vertical' || direction !== 'horizontal') {
      direction = 'horizontal'
    }

    for (var i = 0; i < percents.length; i++) {
      totalPercent += percents[i];
    }
    if (totalPercent > 1 || totalPercent < 0) {
      throw 'Percents must sum to a number be between 0 and 1.' +
          'Was ' + totalPercent;
    }
    percents.push(1 - totalPercent); // Add in last value.
    glift.util.logz(JSON.stringify(percents));

    // Create Data for D3.
    var boxData = [];
    var currentStart = direction === 'horizontal' ? bbox.top() : bbox.left();
    var maxAmount = direction === 'horizontal' ? bbox.height() : bbox.width();
    for (var i = 0; i < percents.length; i++) {
      boxData.push({
        id: 'glift_internal_div_' + glift.util.idGenerator.next(),
        start: currentStart, // e.g., Top
        length: maxAmount * percents[i] // e.g., Height
      });
      currentStart = currentStart + maxAmount * percents[i];
    }

    for (var i = 0; i < boxData.length; i++) {
      $('#' + divId).append('<div id="' + boxData[i].id + '"></div>');
      var cssObj = {
        width: direction === 'horizontal' ? '100%' : boxData[i].length,
        height: direction === 'horizontal' ? boxData[i].length : '100%',
        position: 'absolute'
      };
      var posKey =  (direction === 'horizontal' ? 'top' : 'left' )
      cssObj[posKey] = boxData[i].start;
      $('#' + boxData[i].id).css(cssObj);
    }
    return boxData;
  }
};
