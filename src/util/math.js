goog.provide('glift.math');

goog.require('glift');

glift.math = {
  isEven: function(num1) {
    if ((num1 % 2) == 0) return true;
    else return false;
  },

  // Returns a random integer between min and max
  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  mostlyEqual: function(v1, v2, epsilon) {
    return Math.abs(v1 - v2) <= epsilon
  }
};
