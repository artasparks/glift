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

  isMobile: function() {
    return glift.platform.isAndroid() ||  glift.platform.isIOS();
  }
};
