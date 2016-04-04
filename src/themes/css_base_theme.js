goog.provide('glift.themes.cssBaseTheme');
goog.provide('glift.themes.CssDef');

goog.scope(function() {

/**
 * @param {!Object<string>} css Core css
 * @param {!Object<(string|number)>} extra Extra properties
 * @constructor @struct @final
 */
glift.themes.CssDef = function(css, extra) {
  /**
   * @type {!Object<string>} Base CSS Properties 
   */
  this.css = css;
  /**
   * @type {!Object<string, (string|number)>} Extra properties sometimes
   *    necessary for construction.
   */
  this.extra = extra;
};

/**
 * @type {!Object<glift.themes.classes, !glift.themes.CssDef>}
 */
glift.themes.cssBaseTheme = {};

var base = glift.themes.cssBaseTheme;
var classes = glift.themes.classes;
/**
 * @param {!Object<string>} css
 * @param {!Object<string, (string|number)>=} opt_extra
 * Helper for construction css definitions
 */
var cssDef = function(css, opt_extra) {
  return new glift.themes.CssDef(css, opt_extra || {});
}

// CSS For the bas board.
base[classes.BOARD] = cssDef({
  fill: '#f5be7e',
  stroke: '#000000',
  'stroke-width': '1'
});

base[classes.STARPOINTS] = cssDef({
  fill: 'black',
}, {
  // extra propetries //
  sizeFraction: 0.15 // As a fraction of spacing
});

base[classes.BOARD_LINES] = cssDef({
  stroke: "black",
  'stroke-width': 0.5
});

base[classes.BOARD_COORD_LABELS] = cssDef({
  fill: 'black',
  stroke: 'black',
  opacity: '0.6',
  'font-family': 'sans-serif',
  'font-size': '0.6'
});

base[classes.BOARD_COORD_LABELS] = cssDef({
  fill: 'black',
  stroke: 'black',
  opacity: '0.6',
  'font-family': 'sans-serif',
  'font-size': '0.6'
});

});
