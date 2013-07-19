glift.themes.registered.DEPTH = {
  board: {
    fill: "#f5be7e",
    stroke: "#000000"
  },

  starPoints: {
    sizeFraction: .15, // As a fraction of the spacing.
    fill: '#000000'
  },

  lines: {
    stroke: "#000000",
  },

  stones: {
    marks: {
      'font-family': 'sans-serif'
    },
    shadows: {
      stroke: "none",
      fill: "#555"
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
      "stroke-width": 0, // The default value
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
      stroke: "white",
      fill: "white",
      opacity: 1,
      "stroke-width": 0, // The default value
      marks: {
        fill: 'black',
        stroke: 'black'
      }
    },
    "WHITE_HOVER" : {
      fill: "white",
      opacity: 0.5
    }
  }
};
