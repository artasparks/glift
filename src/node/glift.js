#!/usr/bin/env node

window = {}; // So it doesn't bomb out
glift = {};
require('../compiled/glift_combined.js');
for (var key in glift) {
  exports[key] = glift[key]
}
