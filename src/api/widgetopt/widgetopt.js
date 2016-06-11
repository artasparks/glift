goog.provide('glift.api.widgetopt');
goog.provide('glift.api.WidgetOptFunc');

/**
 * @typedef {function():glift.api.WidgetTypeOptions}
 */
glift.api.WidgetOptFunc

/**
 * A collection of widget options keyed by widget types.
 *
 * @type {!Object<glift.WidgetType, glift.api.WidgetOptFunc>}
 */
glift.api.widgetopt = {};
