goog.provide('glift.array');

/**
 * Collection of utility methods for arrays
 */
glift.array = {
  remove: function(arr, elem) {
    var index = arr.indexOf(elem);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  },

  replace: function(arr, elem, elemRep) {
    var index = arr.indexOf(elem);
    if (index > -1) {
      arr[index] = elemRep;
    }
    return arr;
  }
};
