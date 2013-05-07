glift.themes = {
  registered: {},

  // Accepts a (case sensitive) ID and returns the theme.
  get: function(id) {
    var registered = glift.themes.registered;
    return registered[id] === undefined ? glift.util.none : registered[id];
  },

  // Accepts a (case sensitive) theme ID and true if the theme exists and false
  // otherwise.
  has: function(id) {
    var registered = glift.themes.registered;
    // This isn't scrictly correct because you can set a value in an object to
    // undefined.  However, this is pretty useless for our case (and will cause
    // problems anyway).
    return registered[id] === undefined;
  }
};
