glift.widgets.options = {
  /**
   * Set the defaults on options.  Note: This makes a copy and so is (sort of)
   * an immutable operation on a set of options.
   *
   * options: user specified options object.
   *
   * returns: processed options.
   */
  setOptionDefaults: function(options) {
    var optLib = glift.widgets.options;
    optLib._validateOptions(options);
    var options = glift.util.simpleClone(options);
    var template = glift.util.simpleClone(optLib.baseOptions);

    var topLevelOptions = [
        'divId',
        'sgfList',
        'initialListIndex',
        'allowWrapAround'];
    for (var i = 0; i < topLevelOptions.length; i++) {
      if (!options.hasOwnProperty(topLevelOptions[i])) {
        options[topLevelOptions[i]] = template[topLevelOptions[i]];
      }
    }

    // One level deep objects;
    var templateKeys = [
        'sgfDefaults',
        'globalBookData',
        'display',
        'iconActions',
        'stoneActions'];
    for (var i = 0; i < templateKeys.length; i++) {
      optLib._setDefaults(options, template, templateKeys[i]);
    }

    if (options.sgf) {
      options.sgfList.push(options.sgf);
      delete options['sgf'];
    }
    if (!options.sgf && options.sgfList.length === 0) {
      options.sgfList.push({});
    }
    return options;
  },

  /**
   * Do some basic validity checking on the options.
   *
   * options: user specified options.
   */
  _validateOptions: function(options) {
    if (options.sgf && options.sgfList) {
      throw new Error('Illegal options configuration: you cannot define both ' +
          'sgf and sgfList')
    }
  },

  /**
   * Do a very shallow copy of template keys to the options
   *
   * options: user specified options (now copied)
   * template: base options template (does this need te be passed in?)
   * dataKey: string key to retrieve a subset of the template
   *
   * return: options, with the values filled in from the template.
   */
  _setDefaults: function(options, template, dataKey) {
    var workingObj  = options[dataKey] || {};
    var dataTemplate = template[dataKey];
    for (var optionKey in dataTemplate) {
      if (!workingObj.hasOwnProperty(optionKey)) {
        workingObj[optionKey] = dataTemplate[optionKey];
      }
    }
    options[dataKey] = workingObj;
    return options;
  },

  /**
   * Set some defaults in the sgf object.  This does two passes of 'option'
   * settings.  First we apply the sgfOptions. Then, we apply the
   * widgetOverrides to any options not already filled in.
   *
   * sgf: An object {...} with some settings specified by sgfDefaults.
   * sgfDefaults: Processed SGF defaults.
   *
   * returns: processed (and cloned) sgf object.
   */
  setSgfOptions: function(sgf, sgfDefaults) {
    if (glift.util.typeOf(sgf) !== 'object') {
      throw new Error('SGF must be of type object, was: '
          + glift.util.typeOf(sgf) + ', for ' + sgf);
    }
    var sgf = glift.util.simpleClone(sgf);
    var widgetType = sgf.widgetType || sgfDefaults.widgetType;
    var widgetOverrides = glift.widgets.options[widgetType];
    for (var key in widgetOverrides) {
      if (!sgf[key]) {
        sgf[key] = glift.util.simpleClone(widgetOverrides[key]);
      }
    }

    var nestedData = {'bookData': true};
    for (var key in sgfDefaults) {
      if (!sgf[key] && sgfDefaults[key] !== undefined) {
        sgf[key] = sgfDefaults[key];
      } else if (nestedData[key]) {
        // The SGF must contain the key.
        // TODO(kashomon): Remove this hack.
        for (var subkey in sgfDefaults[key]) {
          if (!sgf[key].hasOwnProperty(subkey)) {
            sgf[key][subkey] = sgfDefaults[key][subkey];
          }
        }
      }
    }
    return sgf;
  }
};
