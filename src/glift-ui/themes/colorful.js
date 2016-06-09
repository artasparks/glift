goog.provide('glift.themes.registered.COLORFUL');

/**
 * A colorful theme used for debugging.
 *
 * @extends {glift.themes.base}
 */
glift.themes.registered.COLORFUL = {
  board: {
    fill: '#f5be7e'
  },

  commentBox: {
    css: {
      background: '#CCF',
      border: '1px solid'
    }
  },

  icons: {
    DEFAULT: {
      fill: 'blue',
      stroke: 'none'
    },
    DEFAULT_HOVER: {
      fill: 'red',
      stroke: 'none'
    }
  }
};
