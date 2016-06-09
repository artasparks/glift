goog.provide('glift.platform');

goog.require('glift');

glift.platform = {
  isIOS: function() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  },

  isAndroid: function() {
    return /Android/i.test(navigator.userAgent);
  },

  isWinPhone: function() {
    return /Windows Phone/i.test(navigator.userAgent);
  },

  /** Whether a page is being viewed by a mobile browser. */
  // TODO(kashomon): Change to inspecting viewport size?
  isMobile: function() {
    return glift.platform.isAndroid() ||
        glift.platform.isIOS() ||
        glift.platform.isWinPhone();
  },

  /** Whether a page can support SVG (and thus Glift).*/
  _supportsSvg: null,
  supportsSvg: function() {
    if (glift.platform._supportsSvg !== null) return glift.platform._supportsSvg;
    // From: http://css-tricks.com/test-support-svg-img/
    glift.platform._supportsSvg = document.implementation.hasFeature(
        'http://www.w3.org/TR/SVG11/feature#Image', '1.1');
    return glift.platform._supportsSvg;
  }
};
