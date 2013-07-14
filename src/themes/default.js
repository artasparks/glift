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
    stroke: "#000000",
  },

  stones: {
    shadows: {
      stroke: "none",
      fill: "#222"
      // transform: "T4,4" -- now depends on spacing
    },
    "EMPTY" : {
      fill: 'blue',
      opacity: 0
    },
    "BLACK" : {
      fill: "black",
      opacity: 1,
      "stroke-width": 1, // The default value
      stroke: "black"
    },
    "BLACK_HOVER" : {
      fill: "black",
      opacity: 0.5
    },
    "WHITE" : {
      stroke: "black",
      fill: "white",
      opacity: 1,
      "stroke-width": 1 // The default value
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
  },

  marks: {
    fill: "black",
    stroke: "white"
  }
};
