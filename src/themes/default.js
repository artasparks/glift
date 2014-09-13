/**
 * The base theme.  All possible theme options must be specified here.
 */
glift.themes.registered.DEFAULT = {
  board: {
    fill: "#f5be7e",
    stroke: "#000000",
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
    'font-family': 'sans-serif'
  },

  stones: {
    shadows: {
      stroke: "none",
      fill: "none"
    },

    marks: {
      'font-family' : 'sans-serif'
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
        }
      }
    },
    BLACK_HOVER : {
      fill: "black",
      opacity: 0.5
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
        }
      }
    },
    WHITE_HOVER : {
      fill: "white",
      stroke: "black",
      opacity: 0.5
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
      borderRadius: '10px'
      // fontSize: '16px',
      // fontFamily: 'Palatino'
    },

    tooltipTimeout: 1000 // milliseconds
  },

  statusBar: {
    icons: {
      vertMargin: 4,
      horzMargin: 5,

      DEFAULT: {
        fill: "#000",
        stroke: '#000',
        opacity: 1.0
      },

      DEFAULT_HOVER: {
        fill: '#000',
        stroke: '#000',
        opacity: 0.3
      },

      tooltips: {
        padding: '5px',
        background: '#555',
        color: '#EEE',
        webkitBorderRadius: '10px',
        MozBorderRadius: '10px',
        borderRadius: '10px'
      },

      tooltipTimeout: 1500 // milliseconds
    }
  },

  commentBox:  {
    css: {
      background: 'none',
      padding: '10px',
      margin: '0px'
      // border: '1px solid',
      // fontSize: '15px',
      // fontFamily: 'Palatino'
    }
  },

  defs: {
    // TODO(kashomon): Support SVG Defs
  }
};
