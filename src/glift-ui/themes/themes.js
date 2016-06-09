goog.provide('glift.themes');

glift.themes = {
  /**
   * Registered themes dict.
   *
   * TODO(kashomon): Make private?  Or perhaps denote with underscore.
   */
  registered: {},

  /**
   * Get a Theme based on ID
   *
   * Accepts a (case sensitive) ID and returns a COPY of the theme.
   *
   * Returns null if no such theme exists.
   *
   * @param {string} id ID of the theme.
   * @return {!glift.themes.base} A theme templated by the relevant them
   *    specified.
   */
  get: function(id) {
    var registered = glift.themes.registered;
    if (!(id in registered)) {
      throw new Error('No theme available for theme with name: ' + id);
    }
    var rawTheme = !(id in registered) ? null : registered[id];
    if (rawTheme) {
      return glift.themes.deepCopy({}, rawTheme, glift.themes.baseTemplate);
    } else {
      return rawTheme;
    }
  },

  /**
   * Copy the theme data from the templateTheme to the themeBase. This is a true
   * deep copy of the properties.  We do this so that we don't pollute the base
   * themes with random data injected later, such as a GoBoard background image.
   *
   * This isn't smart about cycles or crazy things like that, but why would you
   * ever put something like that in a theme?
   *
   * The builder, which should start out an empyty object, is simply a place to
   * dump the copied theme data
   */
  deepCopy: function(builder, themeBase, templateTheme) {
    for (var key in templateTheme) {
      var type = glift.util.typeOf(templateTheme[key]);
      var copyFrom = templateTheme;
      if (themeBase[key] !== undefined) {
        copyFrom = themeBase;
      }

      switch(type) {
        case 'object':
          builder[key] = glift.themes.deepCopy(
              {}, themeBase[key] || {}, templateTheme[key]);
          break;
        case 'array':
          var set = {};
          var out = [];
          var arr = templateTheme[key].concat(themeBase[key] || []);
          for (var i = 0; i < arr.length; i++) {
            // if the items are objects, they won't currently be deep copied.
            var item = arr[i];
            if (item in set) {
              // do nothing
            } else {
              out.push(item);
              set[item] = 1;
            }
          }
          builder[key] = item;
          break;
        default:
          builder[key] = copyFrom[key];
      }
    }
    return builder;
  },

  /**
   * Accepts a (case sensitive) theme ID and true if the theme exists and false
   * otherwise.
   * @param {string} id
   * @return {boolean} Whether or not the theme is regestered.
   */
  has: function(id) {
    var registered = glift.themes.registered;
    // This isn't scrictly correct because you can set a value in an object to
    // undefined.  However, this is pretty useless for our case (and will cause
    // problems anyway).
    return (id in registered);
  },

  /**
   * Set the 'fill' for the go board to be an image
   * For a theme object. This generally assumes you're called 'get' so that you
   * have a copy of the base theme.
   *
   * @param {!glift.themes.base} theme
   * @param {string} value
   */
  setGoBoardBackground: function(theme, value) {
    if (theme) {
      theme.board.imagefill = value
      // "url('" + value  + "')";
    } else {
      throw "Yikes! Not a theme: cannot set background image."
    }
  }
};
