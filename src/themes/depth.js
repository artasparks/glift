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
    shadows: {
      stroke: "none",
      fill: "#555"
      // transform: "T4,4" -- now depends on spacing
    },
    "EMPTY" : {
      fill: 'blue',
      opacity: 0
    },
    "BLACK" : {
      fill: "black",
      opacity: 1,
      "stroke-width": 0, // The default value
      stroke: "black"
    },
    "BLACK_HOVER" : {
      fill: "black",
      opacity: 0.5
    },
    "WHITE" : {
      stroke: "white",
      fill: "white",
      opacity: 1,
      "stroke-width": 0 // The default value
    },
    "WHITE_HOVER" : {
      fill: "white",
      opacity: 0.5
    }
  },

  marks: {
    fill: "black",
    stroke: "white"
  }
};
