goog.provide('glift.ajax');

/**
 * Ajax/XHR wrapper.
 */
glift.ajax = {
  get: function(url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200 || request.status === 304) {
          callback(request.responseText);
        } else {
          // We reached our target server, but it returned an error
          console.log('(' + request.status + ') Error retrieving ' + url);
        }
      }
    };
    request.onerror = function() {
      throw new Error(request.responseText);
      // There was a connection error of some sort
    };
    request.open('GET', url, true);
    request.send();
  }
};
