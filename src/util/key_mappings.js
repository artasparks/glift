glift.keyMappings = {
  _nameToCode: {
    ARROW_LEFT:37,
    ARROW_UP:38,
    ARROW_RIGHT:39,
    ARROW_DOWN:40,
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
    // TODO(kashomon): Add more codes.
  },

  /** Convert a key name (see above) to a standard key code. */
  nameToCode: function(name) {
    if (glift.keyMappings._nameToCode[name]) {
      return glift.keyMappings._nameToCode[name];
    }
    return null;
  },

  _codeToName: undefined, // lazilyDefined below.

  /** Convert a standard key code to a key name (see above). */
  codeToName: function(keyCode) {
    if (glift.keyMappings._codeToName === undefined) {
      var out = {}; // map from key code (e.g., 37) to name (ARROW_LEFT)
      for (var keyName in glift.keyMappings._nameToCode) {
        out[glift.keyMappings._nameToCode[keyName]] = keyName;
      }
      glift.keyMappings._codeToName = out;
    }
    if (glift.keyMappings._codeToName[keyCode]) {
      return glift.keyMappings._codeToName[keyCode];
    }
    return null;
  },

  /**
   * Maps:  
   *  InstanceId -> (to)
   *    KeyName -> (to)
   *      Function or Icon
   */
  _keyBindingMap: {},

  /**
   * Registers a keybinding function with a manager instance.
   *
   * id: Glift manager instance id.
   * keyName: string representing the keypress. Must be a member of _nameToCode.
   * funcOrIcon: The function or icon.name to register.
   */
  registerKeyAction: function(id, keyName, funcOrIcon) {
    var map = glift.keyMappings._keyBindingMap;
    if (!glift.keyMappings.nameToCode(keyName)) {
      // We don't know about this particular keyCode.  It might be an error, or
      // it might be that it needs to be added to the above.
      return;
    }

    if (!map[id]) {
      map[id] = {};
    }
    if (id && keyName && funcOrIcon) {
      map[id][keyName] = funcOrIcon;
    }
  },

  /** Remove all keys associated with an ID. */
  unregisterInstance: function(id) {
    if (glift.keyMappings._keyBindingMap[id]) {
      delete glift.keyMappings._keyBindingMap[id];
    }
  },

  /**
   * Gets a keybinding function or an icon path
   *
   * id: The glift manager instance id.
   * keyName: The number representing the instance.
   */
  getFuncOrIcon: function(id, keyName) {
    var map = glift.keyMappings._keyBindingMap;
    if (id && keyName && map[id] && map[id][keyName]) {
      return map[id][keyName];
    }
    return null;
  },

  /** Whether the listener has been initialized. */
  _initializedListener: false,

  /**
   * Initializes a global listener on keypresses.  Should only be really
   * initialized once, but it's ok to call this function more than once -- it
   * will be idempotent.
   */
  initKeybindingListener: function() {
    if (glift.keyMappings._initializedListener) {
      return;
    }
    // TODO(kashomon): Remove jquery instances
    $('body').keydown(glift.keyMappings._keyHandlerFunc);
    glift.keyMappings._initializedListener = true;
  },

  /**
   * Internal function for processing key-presses.
   */
  _keyHandlerFunc: function(keyEvent) {
    var keyName = glift.keyMappings.codeToName(keyEvent.which);
    var activeId = glift.global.activeInstanceId;
    var bindingMap = glift.keyMappings._keyBindingMap;
    var funcOrIcon = glift.keyMappings.getFuncOrIcon(activeId, keyName);
    if (!funcOrIcon) { return; }

    var argType = glift.util.typeOf(funcOrIcon)
    if (argType === 'function') {
      // TODO(kashomon): Add support for functions.  Left un-added for the
      // time being because it's not clear what parameters to pass.
      // funcOrIcon(); 
    } else if (argType === 'string') {
      // Assume it's an icon-action-path
      var manager = glift.global.instanceRegistry[activeId];
      if (!manager) { return; }

      var widget = manager.getCurrentWidget();
      if (!widget) { return; }

      // icon namespaces look like: icons.arrowleft.mouseup
      var actionNamespace = funcOrIcon.split('.');
      var action = widget.actions[actionNamespace[0]];
      for (var i = 1; i < actionNamespace.length; i++) {
        action = action[actionNamespace[i]];
      }
      action(keyEvent, widget);
    }
  }
};
