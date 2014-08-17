/**
 * Initialization function to be run on glift creation.  Things performed:
 *  - (Compatibility) Whether or not the page supports Glift (SVG)
 *  - (Mobile-Zoom) Disable zoom for mobile, if option specified.
 */
glift.init = function(disableZoomForMobile, divId) {
  // Compatibility.
  if (!glift.platform.supportsSvg()) {
    var text = 'Your browser does not support Glift (lack of SVG support). ' +
        'Please upgrade or try one of ' +
        '<a href="http://browsehappy.com/">these</a>';
    $('#' + divId).append(text);
    // Don't perform any other action and error out.
    throw new Error(text);
  }

  // Disable Zoom for Mobile (should only happens once)
  if (!glift.global.disabledZoom &&
      disableZoomForMobile &&
      glift.platform.isMobile()) {
    $('head meta[name=viewport]').remove();
    $('head').prepend('<meta name="viewport" content="width=device-width, ' +
        'initial-scale=1, maximum-scale=10.0, minimum-scale=1, user-scalable=1" />');
    glift.global.disabledZoom = true; // prevent from being called again.
  }
};
