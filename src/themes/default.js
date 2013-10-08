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
    fill: '#000000'
  },

  lines: {
    stroke: "#000000",
    'stroke-width': 0.5
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
          stroke: '#822',
          fill: '#822'
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
          stroke: '#822',
          fill: '#822'
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
        },
        VARIATION_MARKER : {
          fill: '#DD0000',
          stroke: '#A22'
        }
      }
    },
    WHITE_HOVER : {
      fill: "white",
      stroke: "black",
      opacity: 0.5
    }
  },

  // TODO(kashomon): Add support for gradients.  This is non-trivial.  It
  // requires that we attach defs at the beginning of the SVG.  Not hard, but a
  // little bit of work.
  icons: {
    DEFAULT : {
      fill: "#0000AA",
      stroke: 'black'
      //fill: "90-#337-#55B"
    },
    DEFAULT_HOVER : {
      fill: 'cyan',
      stroke: 'black'
      //fill: "90-#337-#55D"
    }
  },

  commentBar: {
    'font-size': 'normal'
  },

  defs: {
    // TODO(kashomon): Support SVG Defs
  }
};
