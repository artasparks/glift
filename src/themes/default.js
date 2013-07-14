glift.themes.registered.DEFAULT = {
  board: {
    fill: "#f5be7e",
    stroke: "#000000"
  },

  starPoints: {
    sizeFraction: .15, // As a fraction of the spacing.
    fill: '#000000'
  },

  // TODO(kashomon): Remove legacy
  legacy: {
    lineColor: "black",
    lineSize: 1,
    edgeLineSize: 1,
    textColor: "white"
  },

  stones: {
    hoverOpacity: 0.5,
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
    // TODO(kashomon): add
    XMARK : {
    }
  }
};
