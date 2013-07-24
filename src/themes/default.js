glift.themes.registered.DEFAULT = {
  board: {
    fill: "#f5be7e",
    stroke: "#000000"
  },

  starPoints: {
    sizeFraction: .15, // As a fraction of the spacing.
    fill: '#000000'
  },

  lines: {
    stroke: "#000000"
  },

  stones: {
    marks: {
      'font-family' : 'sans-serif',
      'STONE_MARKER' : {
        fill: 'blue',
        opacity: 0.6
      }
    },

    shadows: {
      stroke: "none",
      fill: "#222"
    },

    "EMPTY" : {
      fill: 'blue',
      opacity: 0,
      marks: {
        fill: 'black',
        stroke: 'black'
      }
    },
    "BLACK" : {
      fill: "black",
      opacity: 1,
      "stroke-width": 1, // The default value
      stroke: "black",
      marks: {
        fill: 'white',
        stroke: 'white'
      }
    },
    "BLACK_HOVER" : {
      fill: "black",
      opacity: 0.5
    },
    "WHITE" : {
      stroke: "black",
      fill: "white",
      opacity: 1,
      "stroke-width": 1, // The default value
      marks: {
        fill: 'white',
        stroke: 'white'
      }
    },
    "WHITE_HOVER" : {
      fill: "white",
      opacity: 0.5
    }
  },

  icons: {
    'DEFAULT' : {
      fill: "90-#337-#55B"
    },
    'DEFAULT_HOVER' : {
      fill: "90-#337-#55D"
    }
  }
};
