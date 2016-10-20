goog.provide('glift.themes.base');

/**
 * @typedef {!Object}
 */
// TODO(kashomon): Provide real type
glift.themes.base;

/**
 * Base theme from which all others extend. All possible options should be
 * placed here.
 */
glift.themes.baseTemplate = {
  board: {
    fill: '#f5be7e',
    stroke: '#000000',
    // imagefill -- defined on loading
    'stroke-width': 1
  },

  starPoints: {
    sizeFraction: .15, // As a fraction of the spacing.
    fill: 'black'
  },

  lines: {
    stroke: "black",
    'stroke-width': 0.5
  },

  boardCoordLabels: {
    fill: 'black',
    stroke: 'black',
    opacity: '0.6',
    'font-family': 'sans-serif',
    'font-size': '0.6'
  },

  stones: {
    shadows: {
      stroke: "none",
      fill: "none"
    },

    marks: {
      'font-family' : 'sans-serif',
      'font-size': '0.7'
    },

    EMPTY : {
      fill: 'blue',
      opacity: 0,
      marks: {
        fill: 'black',
        stroke: 'black',
        VARIATION_MARKER : {
          stroke: '#A22',
          fill: '#A22'
        },
        CORRECT_VARIATION : {
          stroke: '#22D',
          fill: '#22D'
        }
      }
    },

    BLACK : {
      fill: "black",
      opacity: 1,
      "stroke-width": 1, // The default value
      stroke: "black",
      marks: {
        fill: 'white',
        stroke: 'white',
        STONE_MARKER : {
          fill: '#CCF',
          opacity: 0.6
        },
        VARIATION_MARKER : {
          stroke: '#A22',
          fill: '#A22'
        },
      }
    },
    // TODO(kashomon): This is a direct copy of most of the properties of BLACK
    // stones and is an ugly hack because I'm not doing inheritance right for
    // these blocks.
    BLACK_HOVER : {
      fill: "black",
      opacity: 0.5,
      "stroke-width": 1, // The default value
      stroke: "black",
      marks: {
        fill: 'white',
        stroke: 'white',
        STONE_MARKER : {
          fill: '#CCF',
          opacity: 0.6
        },
        VARIATION_MARKER : {
          stroke: '#A22',
          fill: '#A22'
        },
      }
    },
    WHITE : {
      stroke: "black",
      fill: "white",
      opacity: 1,
      'stroke-width': 1, // The default value
      marks: {
        fill: 'black',
        stroke: 'black',
        STONE_MARKER : {
          fill: '#33F',
          opacity: 0.6
        },
        VARIATION_MARKER : {
          stroke: '#A22',
          fill: '#A22'
        },
      }
    },
    // TODO(kashomon): This is a direct copy of most of the properties of WHITE
    // stones and is an ugly hack because I'm not doing inheritance right for
    // these blocks.
    WHITE_HOVER : {
      fill: "white",
      stroke: "black",
      opacity: 0.5,
      'stroke-width': 1, // The default value
      marks: {
        fill: 'black',
        stroke: 'black',
        STONE_MARKER : {
          fill: '#33F',
          opacity: 0.6
        },
        VARIATION_MARKER : {
          stroke: '#A22',
          fill: '#A22'
        },
      }
    }
  },

  icons: {
    // Vertical margin in pixels.
    vertMargin: 5,
    // Minimum horizontal margin in pixels.
    horzMargin: 5,

    DEFAULT: {
      fill: "#000",
      stroke: 'black'
      //fill: "90-#337-#55B"
    },

    DEFAULT_HOVER: {
      fill: '#AAA',
      stroke: '#AAA'
      //fill: "90-#337-#55D"
    },

    tooltips: {
      padding: '5px',
      background: '#555',
      color: '#EEE',
      webkitBorderRadius: '10px',
      MozBorderRadius: '10px',
      'border-radius': '10px'
      // fontSize: '16px',
      // fontFamily: 'Palatino'
    },

    tooltipTimeout: 1200 // milliseconds
  },

  statusBar: {
    fullscreen: {
      'background-color': '#FFF'
    },

    gameInfo: {
      textDiv: {
        'background-color': 'rgba(0,0,0,0.75)',
        'border-radius': '25px'
      },
      text: {
        'fontFamily': '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: '#FFF'
      },
      textBody: {
        'margin-bottom': '0.5em'
      },
      textTitle: {
        'margin-bottom': '1em'
      }
    },

    icons: {
      vertMargin: 4,
      horzMargin: 5,

      DEFAULT: {
        fill: "#000",
        stroke: '#000',
        opacity: 1.0
      },

      DEFAULT_HOVER: {
        fill: '#AAA',
        stroke: '#AAA'
      },

      tooltips: {
        padding: '5px',
        background: '#555',
        color: '#EEE',
        webkitBorderRadius: '10px',
        MozBorderRadius: '10px',
        borderRadius: '10px'
      },

      tooltipTimeout: 1200 // milliseconds
    }
  },

  commentBox:  {
    css: {
      background: 'none',
      padding: '10px',
      margin: '0px'
    }
  },

  defs: {
    // TODO(kashomon): Support SVG Defs
  }
};
