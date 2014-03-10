#!/usr/bin/env node

window = {}; // So it doesn't bomb out
glift = {};
require('../compiled/glift_combined.js');
console.log(glift.global.version)
