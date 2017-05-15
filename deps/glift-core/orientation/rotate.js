goog.provide('glift.orientation.AutoRotateCropPrefs');

/**
 * Options for cropping
 * - What are the destination cropping-regions? Either (or both) a side or
 *   corner can be indicated.
 * - Should the points be flipped over the X or Y axis to get to the desired
 *   crop? By default we flip, but this can be overridden to do prefer doing
 *   rotates (if possible). Rotation might seem like the natural approach, but
 *   it's not usually ideal due to asymmetry in the crop-boxes.
 *
 * @typedef {{
 *  corner: (glift.enums.boardRegions|undefined),
 *  side: (glift.enums.boardRegions|undefined),
 *  preferRotate: (boolean|undefined),
 * }}
 */
glift.orientation.AutoRotateCropPrefs;


/**
 * Rotate all point-based properties in a movetree.
 * @param {!glift.rules.MoveTree} movetree
 * @param {!glift.enums.rotations} rotation
 * @return {!glift.rules.MoveTree} root-move tree.
 */
glift.orientation.rotateMovetree = function(movetree, rotation) {
  if (!rotation || rotation === glift.enums.rotations.NO_ROTATION) {
    return movetree.getTreeFromRoot();
  }
  movetree = movetree.newTreeRef();
  var size = movetree.getIntersections();
  movetree.recurseFromRoot(function(mt) {
    var props = mt.properties();
    props.forEach(function(prop, vals) {
      props.rotate(prop, size, rotation);
    });
  });
  return movetree.getTreeFromRoot();
};

/**
 * Flip all point-based properties in a movetree.
 * @param {!glift.rules.MoveTree} movetree
 * @param {!glift.enums.Flip} flip
 * @return {!glift.rules.MoveTree} root-move tree.
 */
glift.orientation.flipMovetree = function(movetree, flip) {
  if (!flip || flip === glift.enums.Flip.NO_FLIP) {
    return movetree.getTreeFromRoot();
  }
  movetree = movetree.newTreeRef();
  var size = movetree.getIntersections();
  movetree.recurseFromRoot(function(mt) {
    var props = mt.properties();
    props.forEach(function(prop, vals) {
      if (flip === glift.enums.Flip.VERTICAL) {
        props.flipVert(prop, size);
      } else {
        props.flipHorz(prop, size);
      }
    });
  });
  return movetree.getTreeFromRoot();
};

/**
 * Automatically rotate a movetree. Relies on findCanonicalRotation to find the
 * correct orientation.
 *
 * Size is determined by examining the sz property of the game.
 * @param {!glift.rules.MoveTree} movetree
 * @param {!glift.orientation.AutoRotateCropPrefs=} opt_prefs
 * @return {!glift.rules.MoveTree}
 */
glift.orientation.autoRotateCrop = function(movetree, opt_prefs) {
  var nmt = movetree.getTreeFromRoot();
  var region = glift.orientation.getQuadCropFromMovetree(nmt);
  var rotation = glift.orientation.findCropRotation_(region, opt_prefs);
  if (rotation == glift.enums.rotations.NO_ROTATION) {
    return nmt.getTreeFromRoot();
  }

  var doRots = !!opt_prefs.preferRotate;
  var flip = glift.enums.Flip.NO_FLIP;
  if (!doRots) {
    flip = glift.orientation.flipForRotation_(region, rotation);
  }

  if (flip !== glift.enums.Flip.NO_FLIP) {
    glift.orientation.flipMovetree(movetree, flip);
  } else {
    glift.orientation.rotateMovetree(movetree, rotation);
  }
  return nmt.getTreeFromRoot();
};


/**
 * Automatically rotate a game by ensuring that the first stone is always in
 * the upper right.
 * @param {!glift.rules.MoveTree} movetree
 * @return {!glift.rules.MoveTree}
 */
glift.orientation.autoRotateGame = function(movetree) {
  var nmt = movetree.getTreeFromRoot();
  var pt = null;
  var props = glift.rules.prop;
  if (nmt.properties().contains(props.B)) {
    pt = nmt.properties().getAsPoint(props.B);
  }
  if (nmt.properties().contains(props.W)) {
    pt = nmt.properties().getAsPoint(props.W);
  }
  if (!pt) {
    nmt.moveDown();
    if (nmt.properties().contains(props.B)) {
      // This is the most common case.
      pt = nmt.properties().getAsPoint(props.B);
    }
    if (nmt.properties().contains(props.W)) {
      pt = nmt.properties().getAsPoint(props.W);
    }
  }
  if (!pt) {
    return nmt.getTreeFromRoot();
  }
  var size = movetree.getIntersections();
  var norm = pt.normalize(size);
  var rot = glift.enums.rotations.NO_ROTATION;
  if (norm.x() > 0 && norm.y() > 0) {
    // Top right. We're good.
    rot = glift.enums.rotations.NO_ROTATION;
  } else if (norm.x() < 0 && norm.y() > 0) {
    // Top left
    rot = glift.enums.rotations.CLOCKWISE_90;
  } else if (norm.x() < 0 && norm.y() < 0) {
    // Bottom left
    rot = glift.enums.rotations.CLOCKWISE_180;
  } else if (norm.x() > 0 && norm.y() < 0) {
    // Bottom Right
    rot = glift.enums.rotations.CLOCKWISE_270;
  }
  return glift.orientation.rotateMovetree(movetree, rot);
};

/**
 * Calculates the desired rotation for a movetree, based on rotation
 * preferences and the movetrees quad-crop.
 *
 * Region ordering should specify what regions the rotation algorithm should
 * target. If not specified, defaults to TOP_RIGHT / TOP.
 *
 * This is primarily intended to be used for problems. It doesn't make sense to
 * rotate commentary diagrams.
 *
 * @param {!glift.rules.MoveTree} movetree
 * @param {!glift.orientation.AutoRotateCropPrefs=} opt_prefs
 * @return {!glift.enums.rotations} The rotation that should be performed.
 */
glift.orientation.findCanonicalRotation = function(movetree, opt_prefs) {
  var region = glift.orientation.getQuadCropFromMovetree(movetree);
  return glift.orientation.findCropRotation_(region, opt_prefs);
};

/**
 * Calculates what rotation is required to go from one orientation to another orientation.
 *
 * @param {!glift.enums.boardRegions} region
 * @param {!glift.orientation.AutoRotateCropPrefs=} opt_prefs
 * @return {!glift.enums.rotations} The rotation that should be performed.
 * @private
 */
glift.orientation.findCropRotation_ = function(region, opt_prefs) {
  var boardRegions = glift.enums.boardRegions;
  var rotations = glift.enums.rotations;
  var cornerRegions = {
    TOP_LEFT: 0,
    BOTTOM_LEFT: 90,
    BOTTOM_RIGHT: 180,
    TOP_RIGHT: 270
  };
  var sideRegions = {
    TOP: 0,
    LEFT: 90,
    BOTTOM: 180,
    RIGHT: 270
  };

  var prefs = opt_prefs || {};
  var isCorner = cornerRegions.hasOwnProperty(region);
  var isSide = sideRegions.hasOwnProperty(region);

  if (!prefs.side && isSide) {
    // No rotation prefs have been specified for sides.
    return rotations.NO_ROTATION;
  }
  if (!prefs.corner && isCorner) {
    // No rotation prefs have been specified for corners.
    return rotations.NO_ROTATION;
  }
  if (!isCorner && !isSide) {
    // Neither a corner nor a side. Nothing to do.
    return rotations.NO_ROTATION;
  }

  if (cornerRegions[region] !== undefined ||
      sideRegions[region] !== undefined) {
    var start = 0, end = 0;
    if (cornerRegions[region] !== undefined) {
      start = cornerRegions[region];
      end = cornerRegions[prefs.corner];
    }

    if (sideRegions[region] !== undefined) {
      start = sideRegions[region];
      end = sideRegions[prefs.side];
    }

    var rot = (360 + start - end) % 360;
    switch(rot) {
      case 0: return rotations.NO_ROTATION;
      case 90: return rotations.CLOCKWISE_90;
      case 180: return rotations.CLOCKWISE_180;
      case 270: return rotations.CLOCKWISE_270;
      default: return rotations.NO_ROTATION;
    }
  }

  // No rotations. We only rotate when the quad crop region is either a corner
  // or a side.
  return rotations.NO_ROTATION;
};

/**
 * @param {glift.enums.boardRegions} region
 * @param {glift.enums.rotations} rotation
 * @return {glift.enums.Flip}
 * @private
 */
glift.orientation.flipForRotation_ = function(region, rotation) {
  var br = glift.enums.boardRegions;
  var rots = glift.enums.rotations;

  // For when the board region is a corner.
  if (rotation === rots.CLOCKWISE_90 &&
      (region == br.TOP_LEFT || region == br.BOTTOM_RIGHT)) {
    return glift.enums.Flip.HORIZONTAL;

  } else if (rotation === rots.CLOCKWISE_90 &&
      (region == br.TOP_RIGHT || region == br.BOTTOM_LEFT)) {
    return glift.enums.Flip.VERTICAL;

  } else if (rotation === rots.CLOCKWISE_270 &&
      (region == br.TOP_LEFT || region == br.BOTTOM_RIGHT)) {
    return glift.enums.Flip.VERTICAL;

  } else if (rotation === rots.CLOCKWISE_270 &&
      (region == br.TOP_RIGHT || region == br.BOTTOM_LEFT)) {
    return glift.enums.Flip.HORIZONTAL;
  }

  // For when the board region is a side.
  else if (rotation === rots.CLOCKWISE_180 &&
      (region == br.TOP || region == br.BOTTOM)) {
    return glift.enums.Flip.VERTICAL;

  } else if (rotation === rots.CLOCKWISE_180 &&
      (region == br.LEFT || region == br.RIGHT)) {
    return glift.enums.Flip.HORIZONTAL;
  }

  return glift.enums.Flip.NO_FLIP;
};
