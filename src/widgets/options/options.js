glift.widgets.options = {
  setDefaults: function(options, defaultOptionSet) {
    var defaultOptionSet = defaultOptionSet || 'base';
    var optionsTemplate = glift.widgets.options[defaultOptionSet];
    for (var optionName in optionsTemplate) {
      if (options[optionName] === undefined) {
        // Do a real copy for arrays.
        if (glift.util.typeOf(optionsTemplate[optionName]) === 'array') {
          options[optionName] = [];
          for (var i = 0; i < optionsTemplate[optionName].length; i++) {
            options[optionName].push(optionsTemplate[optionName][i]);
          }
        } else {
          options[optionName] = optionsTemplate[optionName];
        }
      }
    }
    glift.widgets.options.setDefaultActions(options, optionsTemplate);
    return options;
  },

  setDefaultActions: function(options, optionsTemplate) {
    // If the user specifies only a partial set of actions, we try to fill the
    // unspecified actions.
    for (var category in optionsTemplate.actions) {
      if (options.actions[category] === undefined) {
        options.actions[category] = optionsTemplate.actions[category];
      }
    }
    for (var event in optionsTemplate.actions.stones) {
      if (options.actions.stones[event] === undefined) {
        options.actions.stones[event] =
            optionsTemplate.actions.stones[event];
      }
    }
    for (var icon in optionsTemplate.actions.icons) {
      if (options.actions.icons[icon] === undefined) {
        options.actions.icons[icon] =
            optionsTemplate.actions.icons[icon];
      }
      for (var action in optionsTemplate.actions.icons[icon]) {
        if (options.actions.icons[icon][action] === undefined) {
          options.actions.icons[icon][action] =
              optionsTemplate.actions.icons[icon][action];
        }
      }
    }
  }
};
