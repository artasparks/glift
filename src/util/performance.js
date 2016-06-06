goog.require('glift.util');

glift.util.perfLog = function(msg) {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'NONE') {
    return;
  }
  var time = glift.util.perfTime();
  var lastMajor = glift.global.perf.lastMajor;
  var last = glift.global.perf.last;
  console.log("Since Major Record: " + (time - lastMajor + "ms. " + msg));
  if (glift.global.performanceDebugLevel === 'FINE') {
    console.log("  Since Last Record: " + (time - last + "ms. " + msg));
  }
  glift.global.perf.last = time;
};

glift.util.majorPerfLog = function(msg) {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'NONE') {
    return;
  }
  var time = glift.util.perfTime();
  glift.util.perfLog(msg);
  glift.global.perf.lastMajor = time;
};

glift.util.perfDone = function() {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'NONE') {
    return;
  }
  var time = glift.util.perfTime();
  var first = glift.global.perf.first;
  var lastMajor = glift.global.perf.lastMajor;
  console.log("---Performance Test Complete---");
  console.log("Since Beginning: " + (time - first) + 'ms.')
};

glift.util.perfInit = function() {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'NONE') {
    return;
  }
  var t = glift.util.perfTime();
  glift.global.perf = { first: t, last: t, lastMajor: t};
};

glift.util.perfTime = function() {
  return (new Date()).getTime();
};
