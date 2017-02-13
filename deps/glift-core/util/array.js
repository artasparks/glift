goog.provide('glift.array');

goog.require('glift');

/**
 * Collection of utility methods for arrays
 */
glift.array = {
  /**
   * @param {!Array<!T>} arr
   * @param {!T} elem
   * @return {!Array<!T>} The array with the element removed.
   *
   * @template T
   */
  remove: function(arr, elem) {
    var index = arr.indexOf(elem);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  },

  /**
   * @param {!Array<!T>} arr
   * @param {!T} elem
   * @param {!T} elemRep
   * @return {!Array<!T>} The array with the element replaced.
   *
   * @template T
   */
  replace: function(arr, elem, elemRep) {
    var index = arr.indexOf(elem);
    if (index > -1) {
      arr[index] = elemRep;
    }
    return arr;
  }
};
