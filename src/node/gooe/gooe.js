#!/usr/bin/env node


/**
 * Core functionality for generating gooe diagrams.
 */
path = require('path');
glift = require('../glift.js');
fs = require('fs');

var GLIFT_BOOK_SPEC = 'glift_problem_book_spec.txt';

// console.log(glift.global.version);
// console.log(process.argv);
var inputDir = process.argv[2];
if (inputDir === undefined) {
  console.log("Input directory must be specified.");
  process.exit(1); 
}

if (!fs.existsSync(inputDir)) {
  console.log("Directory does not exist: " + inputDir);
  process.exit(1);
}

var outputDir = 'genoutput';
if (!fs.existsSync(path.join(inputDir, outputDir))) {
  console.log("Output directory '" + path.join(inputDir,  outputDir)
    + "' does not exist. " + inputDir);
  process.exit(1);
}

if (fs.existsSync(path.join(inputDir, GLIFT_BOOK_SPEC))) {
  var inputFiles = fs.readFileSync(path.join(inputDir, GLIFT_BOOK_SPEC), 'UTF8').split('\n');
} else {
  var inputFiles = fs.readdirSync(inputDir);
}

var defz = glift.displays.diagrams.gooe.defs;
var document = [];
document.push(glift.displays.diagrams.gooe.documentHeader());
document.push("");

var createCollisionComment = function(flattened) {
  // Collisions have the form:
  //  [
  //    {/*move*/ 
  //      point: <point>, 
  //      color: <color>, 
  //      moveNum: <moveNum>,
  //      collision: { 
  //        point: <point>,
  //        color: <point>
  //      }
  //    },
  //    ...
  var outComment= "{\\it ";
  var collisions = flattened.collisions;
  for (var i = 0; i < collisions.length; i++) {
    var c = collisions[i];
    var color = c.color;
    outComment += 
        color.charAt(0).toUpperCase() + color.slice(1).toLowerCase() 
        + " " + c.moveNum 
        + " at " + flattened.getLabelIntPt(c.point.toString());
    if (i < collisions.length - 1) {
      outComment += ', ';
    } else {
      outComment += '.';
    }
  }
  outComment += '}';
  return outComment;
};

var createProblemFunc = function(document, mt, goban, varPath, comSuffix) {
  var vars = glift.enums.showVariations.NEVER;
  var defz = glift.displays.diagrams.gooe.defs;
  document.push(defz.problemHeader);
  var flattened = glift.bridge.flattener.flatten(
      mt, goban, boardRegions.AUTO, vars, varPath);
  var gooeArray = glift.displays.diagrams.gooe.diagramArray(flattened);
  var strOut = glift.displays.diagrams.gooe.diagramArrToString(gooeArray);
  document.push(strOut)
  if (flattened.comment.length > 0) {
    document.push("");
    document.push(comSuffix + '. ' + flattened.comment);
  } else {
    document.push("");
    document.push(comSuffix)
  }
  if (flattened.collisions.length > 0) {
    document.push("");
    document.push(createCollisionComment(flattened));
  }
  document.push(defz.problemFooter)
  document.push("");
};

var boardRegions = glift.enums.boardRegions;
var vars = glift.enums.showVariations.NEVER;
var filteredNames = [];
for (var i = 0; i < inputFiles.length; i++) {
  var possFile = inputFiles[i];
  if (possFile.indexOf('\.sgf') !== -1) {
    filteredNames.push(possFile);
  } else if (possFile.indexOf('>>') === 0) {
    filteredNames.push(possFile);
  }
}

var diagramNum = 0
for (var i = 0; i < filteredNames.length; i++) {
  var possibleFile = filteredNames[i];
  if (possibleFile.indexOf('>>') === 0) {
    document.push(possibleFile.slice(2));
    continue;
  }

  console.log("Processing: " + possibleFile);
  diagramNum++;
  var sgfData = fs.readFileSync(path.join(inputDir, possibleFile), 'UTF8');
  var movetree = glift.rules.movetree.getFromSgf(sgfData);
  var goban = glift.rules.goban.getFromMoveTree(movetree, []).goban;

  var i2 = i;
  if (i + 1 < filteredNames.length) {
    i2 = i + 1;
    var possibleFile2 = filteredNames[i2];
    console.log("Processing: " + possibleFile2);
    var sgfData2 = fs.readFileSync(path.join(inputDir, possibleFile2), 'UTF8');
    var movetree2 = glift.rules.movetree.getFromSgf(sgfData2);
    var goban2 = glift.rules.goban.getFromMoveTree(movetree2, []).goban;
  }

  var d1Header = 'Problem ' + (diagramNum);
  var d2Header = d1Header;
  document.push('\\vfill');
  createProblemFunc(document, movetree, goban, '0', '{\\bf ' + d1Header + '}');
  if (i2 !== i) {
    var d2Header = 'Problem ' + (diagramNum + 1);
    document.push('\\vfill');
    createProblemFunc(document, movetree2, goban2, '0', '{\\bf ' + d2Header + '}');
  }
  document.push('\\vfill');
  document.push('\\newpage');

  document.push('\\vfill');
  createProblemFunc(document, movetree, goban, '0.0+', d1Header);
  document.push('\\vfill');
  createProblemFunc(document, movetree, goban, '0.1+', d1Header + '. Incorrect');
  document.push('\\vfill');
  document.push('\\newpage');

  if (i2 !== i) {
    document.push('\\vfill');
    createProblemFunc(document, movetree2, goban2, '0.0+', d2Header);
    document.push('\\vfill');
    createProblemFunc(document, movetree2, goban2, '0.1+', d2Header + '. Incorrect');
    document.push('\\vfill');
  }
  document.push('\\newpage');

  if (i2 !== i) {
    i = i2;
    diagramNum++;
  }
}
document.push(defz.basicFooter);

if (!fs.existsSync(path.join(outputDir,  'gooemacs.sty'))) {
  var gooeDir = path.join(path.dirname(module.filename) + '../../fonts/gooe');
  var gooeFiles = fs.readdirSync(gooeDir);
  var styleFileReg = /gooemacs.tex/;
  var copyFile = function(inFile, outFile) {
    fs.createReadStream(inFile).pipe(fs.createWriteStream(outFile));
  };
  for (var i = 0; i < gooeFiles.length; i++) {
    var gooeFile = gooeFiles[i];
    if (styleFileReg.test(gooeFile)) {
      copyFile(path.join(gooeDir, gooeFile), path.join(outputDir,  'gooemacs.sty'))
    } else {
      copyFile(path.join(gooeDir, gooeFile), path.join(outputDir, gooeFile));
    }
  }
}

fs.writeFileSync(path.join(outputDir, 'generated.tex'), document.join("\n"));
