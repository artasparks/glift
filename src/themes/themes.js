glift.themes = {
  registered: {},

  // Accepts a (case sensitive) ID and returns a COPY of the theme.
  get: function(id) {
    var registered = glift.themes.registered;
    var rawTheme = !(id in registered) ? glift.util.none : registered[id];

    // Perform the DeepCopy
    var themeCopy = jQuery.extend(true, {}, rawTheme);
    return themeCopy;
  },

  // Accepts a (case sensitive) theme ID and true if the theme exists and false
  // otherwise.
  has: function(id) {
    var registered = glift.themes.registered;
    // This isn't scrictly correct because you can set a value in an object to
    // undefined.  However, this is pretty useless for our case (and will cause
    // problems anyway).
    return (id in registered);
  },

  // For a theme object. This generally assumes you're called 'get' so that you
  // have a copy of the base theme.
  setGoBoardBackground: function(theme, value) {
    if (theme) {
      theme.board.imagefill = value
      // "url('" + value  + "')";
    } else {
      throw "Yikes! Not a theme: cannot set background image."
    }
  }
};
