glift.platform = {
  _isIOS:  null,
  isIOS: function() {
    if (glift.platform._isIOS !== null) return glift.platform._isIOS;
    glift.platform._isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return glift.platform._isIOS;
  },

  _isAndroid: null,
  isAndroid: function() {
    if (glift.platform._isAndroid !== null) return glift.platform._isAndroid;
    glift.platform._isAndroid = /Android/i.test(navigator.userAgent);
    return glift.platform._isAndroid;
  },

  _isWinPhone: null,
  isWinPhone: function() {
    if (glift.platform._isWinPhone !== null) return glift.platform._isWinPhone;
    glift.platform._isWinPhone = /Windows Phone/i.test(navigator.userAgent);
    return glift.platform._isWinPhone;
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
        "http://www.w3.org/TR/SVG11/feature#Image", "1.1");
    return glift.platform._supportsSvg;
  }
};
