glift.keyMappings = {
  /**
   * Some keys must be bound with 'keydown' rather than key code
   * mappings.
   */
  _nameToCodeKeyDown: {
    BACKSPACE: 8,
    ESCAPE: 27,
    ARROW_LEFT:37,
    ARROW_UP:38,
    ARROW_RIGHT:39,
    ARROW_DOWN:40
  },

  _codeToNameKeyDown: undefined, // lazilyDefined

  /** Convert a key name (see above) to a standard key code. */
  nameToCode: function(name) {
    if (name.length !== 1) {
      if (/[A-Z](_[A-Z]+)*/.test(name)) {
        return glift.keyMappings._nameToCodeKeyDown[name] || null
      } else {
        return null
      }
    } else {
      return name.charCodeAt(0);
    }
  },

  /** Convert a standard key code to a key name (see above). */
  codeToName: function(keyCode) {
    if (!glift.keyMappings._codeToNameKeyDown) {
      // Bite the bullet and define the map.
      var newmap = {};
      for (var name in glift.keyMappings._nameToCodeKeyDown) {
        var keycode = glift.keyMappings._nameToCodeKeyDown[name]
        newmap[keycode] = name;
      }
      glift.keyMappings._codeToNameKeyDown = newmap;
    }
    if (glift.keyMappings._codeToNameKeyDown[keyCode]) {
      return glift.keyMappings._codeToNameKeyDown[keyCode];
    } else {
      return String.fromCharCode(keyCode) || null;
    }
  },

  /**
   * The master keybinding registry.
   *
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
      throw new Error('Unknown key name: ' + keyName);
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
  initKeybindingListener: function(that) {

    if (glift.keyMappings._initializedListener) {
      return;
    }
    var wrapper = document.getElementById(that.wrapperDivId);

    // Note: difference between keypress and keydown!
    //
    // We use keydown so we can capture the left/right arrow keys, but keypress
    // should be preferred since it's easier to get the char code.
    wrapper.addEventListener('keydown', glift.keyMappings._keyHandlerFunc);
    wrapper.addEventListener('keypress', glift.keyMappings._keyHandlerFunc);

    wrapper.addEventListener('focus', function(event) {
      that.statusBar.setKeyboardOpacity(1);
    });
    wrapper.addEventListener('blur', function(event) {
      that.statusBar.setKeyboardOpacity(0.5);
    });
    wrapper.setAttribute('tabindex', '0'); // allows div to have focus
    wrapper.focus();

    glift.keyMappings._initializedListener = true;
  },

  /**
   * Internal function for processing key-presses.
   */
  _keyHandlerFunc: function(keyEvent) {
    var keyName = glift.keyMappings.codeToName(keyEvent.which);// || e.charCode);
    if (keyEvent.type === 'keydown' && !(/[A-Z_]+/.test(keyName))) {
      // This key should be processed by the keypress event rather than this
      // one.
      return;
    }

    var activeId = glift.global.activeInstanceId;
    var bindingMap = glift.keyMappings._keyBindingMap;
    var funcOrIcon = glift.keyMappings.getFuncOrIcon(activeId, keyName);
    if (!funcOrIcon) { return; }

    var manager = glift.global.instanceRegistry[activeId];
    if (!manager) { return; }

    var widget = manager.getCurrentWidget();
    if (!widget) { return; }

    var argType = glift.util.typeOf(funcOrIcon)

    if (argType === 'function') {
      funcOrIcon(widget);
      if (manager.isFullscreen()) {
        // We don't want the widget interacting with anything else while
        // full-screen.
        if (event.preventDefault) event.preventDefault();
        else  event.returnValue = false; // IE
      }
    } else if (argType === 'string') {
      // Assume it's an icon-action-path
      // icon namespaces look like: icons.arrowleft.mouseup
      var actionNamespace = funcOrIcon.split('.');
      var action = widget.actions[actionNamespace[0]];
      for (var i = 1; i < actionNamespace.length; i++) {
        action = action[actionNamespace[i]];
      }
      action(keyEvent, widget);
      if (manager.isFullscreen()) {
        // We don't want the widget interacting with anything else while
        // full-screen.
        if (event.preventDefault) event.preventDefault();
        else  event.returnValue = false; // IE
      }
    }
  }
};
