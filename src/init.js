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
    glift.dom.elem(divId).html(text);
    // Don't perform any other action and error out.
    throw new Error(text);
  }

  // Disable Zoom for Mobile (should only happens once)
  if (!glift.global.disabledZoom &&
      disableZoomForMobile &&
      glift.platform.isMobile()) {
    var metas = document.getElementsByTagName('meta');
    var noZoomContent = 'width=device-width, ' +
        'maximum-scale=1.0, minimum-scale=1.0, user-scalable=no'
    for (var i = 0, len = metas.length; i < len; i++){
      var name = metas[i] ? metas[i].getAttribute('name') : null;
      if (name && name.toLowerCase() === 'viewport'){
        glift.dom.elem(metas[i]).remove();
      }
    }
    var head = glift.dom.elem(document.head);
    var newMeta = glift.dom.elem(document.createElement('meta'));
    newMeta.attr('name', 'viewport');
    newMeta.attr('content', noZoomContent);
    head.prepend(newMeta);
    glift.global.disabledZoom = true; // prevent from being called again.
  }
};
