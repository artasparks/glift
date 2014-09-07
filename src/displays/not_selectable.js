glift.displays.setNotSelectable = function(divId) {
  // Note to self: common vendor property patterns:
  //
  // -webkit-property => webkitProperty
  // -moz-property => MozProperty
  // -ms-property => msProperty
  // -o-property => OProperty
  // property => property
  glift.dom.elem(divId).css({
      'webkitTouchCallout': 'none',
      'webkitUserSelect': 'none',
      'MozUserSelect': 'moz-none',
      'msUserSelect': 'none',
      'user-select': 'none',
      'webkitHighlight': 'none',
      'webkitTapHighlightColor': 'rgba(0,0,0,0)',
      'cursor': 'default'
  });
};
