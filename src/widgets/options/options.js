glift.widgets.options = {
  /**
   * Set the defaults on options.  Note: This makes a copy and so is (sort of)
   * an immutable operation on a set of options.
   */
  setBaseOptionDefaults: function(options) {
    var options = glift.util.simpleClone(options);
    var baseTemplate = glift.util.simpleClone(
        glift.widgets.options.baseOptions);
    for (var optionName in baseTemplate) {
      if (optionName === 'sgfDefaults') {
        options.sgfDefaults = options.sgfDefaults || {};
        for (var key in baseTemplate.sgfDefaults) {
          if (options.sgfDefaults[key] === undefined) {
            options.sgfDefaults[key] = baseTemplate.sgfDefaults[key];
          }
        }
      } else if (options[optionName] === undefined) {
        options[optionName] = baseTemplate[optionName];
      }
    }
    return options
  },

  /**
   * Set the default SGF Options.  At this point, we assume that that
   * baseOptions has alreday been copied and filled in.  The process of
   * setting the sgf options goes as follows:
   *
   * 1. Get the default WidgetType from the sgfDefaults.
   * 2. Retrieve the WidgetType overrides.
   * Then:
   *  3. Prefer first options set explicitly in the (user provided) sgfObj
   *  4. Then, prefer options set in the WidgetType Overrides
   *  5. Finally, prefer options set in baseOptions.sgfDefaults
   */
  setSgfOptionDefaults: function(sgfObj, sgfDefaults) {
    if (!sgfObj) throw "SGF Obj undefined";
    if (!sgfDefaults) throw "SGF Defaults undefined";

    sgfObj = glift.util.simpleClone(sgfObj);
    sgfDefaults = glift.util.simpleClone(sgfDefaults);
    sgfObj.widgetType = sgfObj.widgetType || sgfDefaults.widgetType;
    var widgetTypeOverrides = glift.util.simpleClone(
        glift.widgets.options[sgfObj.widgetType]);
    for (var key in sgfDefaults) {
      if (key in sgfObj) {
      } else if (key in widgetTypeOverrides) {
        sgfObj[key] = widgetTypeOverrides[key];
      } else {
        sgfObj[key] = sgfDefaults[key];
      }
    }
    return sgfObj;
  },

  /**
   * Get only the widget specific options -- i.e. not manager options nor sgf
   * options.
   */
  getDisplayOptions: function(fullOptions) {
    var outOptions = {};
    var ignore = {
      sgfList: true,
      sgf: true,
      initialListIndex: true,
      allowWrapAround: true,
      sgfDefaults: true
    };
    for (var key in fullOptions) {
      if (!ignore[key]) {
        outOptions[key] = fullOptions[key];
      }
    }
    return outOptions;
  }
};
