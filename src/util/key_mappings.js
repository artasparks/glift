glift.keyMappings = {
  _nameToCode: {
    ARROW_LEFT:37,
    ARROW_UP:38,
    ARROW_RIGHT:39,
    ARROW_:40,
    BACKSPACE:8,
    ENTER:13,
    SHIFT:16,
    FORWARD_SLASH:191,
    A:65,
    B:66,
    C:67,
    D:68,
    E:69,
    F:70,
    G:71,
    H:72,
    I:73,
    J:74,
    K:75
  },

  nameToCode: function(name) {
    return glift.keyMappings._nameToCode[name];
  },

  _codeToName: undefined, // lazilyDefined

  codeToName: function(keyCode) {
    if (glift.keyMappings._codeToName === undefined) {
      var out = {};
      for (var keyName in glift.keyMappings._nameToCode) {
        out[glift.keyMappings._nameToCode[keyName]] = keyName;
      }
      glift.keyMappings._codeToName = out;
    }
    return glift.keyMappings._codeToName[keyCode];
  }
};
