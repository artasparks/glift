path = require('path');
glift = require('../glift.js');
fs = require('fs');

var inputJsPath  = process.argv[2];

if (!inputJsPath) {
  console.log("Input Spec path needs to be defined.");
  process.exit(1);
}

if (!fs.existsSync(inputJsPath)) {
  console.log("File does not exist: " + inputJsPath);
  process.exit(1);
}

var sgfData = fs.readFileSync(inputJsPath, 'UTF8');
var inOptions = JSON.parse(sgfData);
var manager = glift.widgets.createNoDraw(inOptions);

// Monkey-patch the loadSgfWithAjax func.  There's probably a better way to do
// this. =/
manager.loadSgfWithAjax = function(path, sgfObj, callback) {
  if (path && manager.sgfCache[path]) {
    sgfObj.sgfString = manager.sgfCache[path];
    callback(sgfObj);
  } else {
    var data = fs.readFileSync(path, 'UTF8');
    manager.sgfCache[path] = data;
    sgfObj.sgfString = data;
    callback(sgfObj);
  }
};

glift.bridge.managerConverter.toBook(manager, function(output) {
  var outputFile = inputJsPath.replace('.js', '.tex');
  fs.writeFileSync(outputFile, output);
});
