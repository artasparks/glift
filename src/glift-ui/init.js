/**
 * Initialization function to be run on glift-ui creation.  Things performed:
 *  - (Compatibility) Whether or not the page supports Glift (SVG)
 *  - (Mobile-Zoom) Disable zoom for mobile, if option specified.
 */
glift.init = function(disableZoomForMobile, divId) {
  // Compatibility.
  if (!glift.platform.supportsSvg()) {
    var text = 'Your browser does not support Glift, this Go viewer, ' +
        'due to lack of SVG support. ' +
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
    var head = document.head;
    if (head == null) {
      throw new Error('document.head was null, ' +
          'but it must not be null for disable zoom to work.');
    }
    head = glift.dom.elem(/** @type {!HTMLHeadElement} */ (head));
    var newMeta = glift.dom.elem(document.createElement('meta'))
        .setAttr('name', 'viewport')
        .setAttr('content', noZoomContent);
    head.prepend(newMeta);
    glift.global.disabledZoom = true; // prevent from being called again.
  }

  if (!glift.global.addedCssClasses) {
    // Add any CSS classes that we need
    var style = document.createElement('style');
    style.type = 'text/css';
    // TODO(kashomon): Make these constants or something.
    style.innerHTML = [
        // Disable scrolling.  This appears to only work for desktops.
        '.glift-fullscreen-no-scroll { overflow: hidden; }',
        // Comment box class is used primarily as an identifier, but it's
        // defined here as aglobal indicator.
        '.glift-comment-box {}'].join('\n');
    document.getElementsByTagName('head')[0].appendChild(style);
    glift.global.addedCssClasses = true;
  }
};
