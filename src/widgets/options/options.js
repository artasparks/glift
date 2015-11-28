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
    options = glift.util.simpleClone(options);
    var template = glift.util.simpleClone(optLib.baseOptions);

    var topLevelOptions = [
        'divId',
        'sgfCollection',
        'sgfMapping',
        'initialIndex',
        'allowWrapAround',
        'loadCollectionInBackground',
        'metadata'];
    for (var i = 0; i < topLevelOptions.length; i++) {
      if (!options.hasOwnProperty(topLevelOptions[i])) {
        options[topLevelOptions[i]] = template[topLevelOptions[i]];
      }
    }

    // One level deep objects. We don't want to recursively copy keys over --
    // Some options are specified as objects or arrays which need to be
    // overwritten in full if they are specified.
    var templateKeys = [
        'sgfDefaults',
        'display',
        'hooks',
        'iconActions',
        'stoneActions'];
    for (var i = 0; i < templateKeys.length; i++) {
      optLib._setDefaults(options, template, templateKeys[i]);
    }

    if (options.sgf) {
      options.sgfCollection = [];
      options.sgfCollection.push(options.sgf);
      options.sgf = undefined;
    }
    if (!options.sgf && !options.sgfCollection) {
      options.sgfCollection = [{}];
    }
    return options;
  },

  /**
   * Do some basic validity checking on the options.
   *
   * options: user specified options.
   */
  _validateOptions: function(options) {
    if (options.sgf && options.sgfCollection) {
      throw new Error('Illegal options configuration: you cannot define both ' +
          'sgf and sgfCollection')
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
    sgf = glift.util.simpleClone(sgf);
    var widgetType = sgf.widgetType || sgfDefaults.widgetType;
    var widgetOverrides = glift.widgets.options[widgetType];
    for (var key in widgetOverrides) {
      if (!sgf[key]) {
        sgf[key] = glift.util.simpleClone(widgetOverrides[key]);
      }
    }

    for (var key in sgfDefaults) {
      if (!sgf[key] && sgfDefaults[key] !== undefined) {
        sgf[key] = sgfDefaults[key];
      }
    }
    return sgf;
  }
};
