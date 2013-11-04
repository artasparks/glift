glift.widgets.options = {
  /**
   * Set the defaults on options.  Note: This makes a copy and so is (sort of)
   * an immutable operation on options.
   */
  setWidgetOptionDefaults: function(options) {
    var options = glift.util.simpleClone(options);
    var baseTemplate = glift.util.simpleClone(glift.widgets.options.base);
    for (var optionName in baseTemplate) {
      if (options[optionName] === undefined) {
        options[optionName] = baseTemplate[optionName];
      }
    }
    return options
  },

  setSgfOptionDefaults: function(sgfObj, widgetOptions) {
    var sgfTemplate = glift.util.simpleClone(glift.widgets.options.sgf);
    sgfObj.widgetType = sgfObj.widgetType || widgetOptions.defaultWidgetType;
    sgfObj.problemConditions = sgfObj.problemConditions
        || widgetOptions.defaultProblemConditions;
    var widgetTypeTemplate = glift.util.simpleClone(
        glift.widgets.options[sgfObj.widgetType]);
    glift.util.logz(sgfObj.widgetType);
    for (var key in sgfTemplate) {
      if (key in sgfObj) {
        // Leave it alone: we don't want to override user provided defaults.
      } else if (key in widgetTypeTemplate) {
        sgfObj[key] = widgetTypeTemplate[key];
      } else {
        sgfObj[key] = sgfTemplate[key];
      }
    }
    return sgfObj;
  },

  getWidgetOptions: function(fullOptions) {
    var outOptions = {};
    for (var key in fullOptions) {
      if (key !== 'sgfList' && key !== 'sgf' && key !== 'initialListIndex') {
        outOptions[key] = fullOptions[key];
      }
    }
    return outOptions;
  },

  getMangerOptions: function(fullOptions) {
    return {
      sgfList: fullOptions.sgfList,
      initialListIndex: fullOptions.initialListIndex
    };
  }
};
