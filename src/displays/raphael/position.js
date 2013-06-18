glift.displays.raphael.rowCenter = function(
      outerBox, raphaelBboxes, vertMargin, horzMargin, spacing) {
  var inBboxes = [];
  for (var i = 0; i < raphaelBboxes.length; i++) {
    inBboxes[i] = glift.displays.fromRaphaelBbox(raphaelBboxes[i]);
  }
  return glift.displays.raphael.position.rowCenter(
      outerBox, inBboxes, vertMargin, horzMargin, spacing);
};
