goog.provide('glift.ajax');

/**
 * Ajax/XHR wrapper.
 */
glift.ajax = {
  /**
   * @param {string} url
   * @param {function(string)} successCallback
   * @param {function(number, string)=} opt_failureCallback
   */
  get: function(url, successCallback, opt_failureCallback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200 || request.status === 304) {
          successCallback(request.responseText);
        } else {
          if (opt_failureCallback) {
            opt_failureCallback(request.status, request.responseText);
          } else {
            // We reached our target server, but it returned an error
            console.error('(' + request.status + ') Error retrieving ' + url);
          }
        }
      }
    };
    request.onerror = function() {
      if (opt_failureCallback) {
        opt_failureCallback(request.status, request.responseText);
      } else {
        // We reached our target server, but it returned an error
        console.error('(' + request.status + ') Error retrieving ' + url 
            + '. ' + request.responseText);
      }
      // There was a connection error of some sort.
    };
    request.open('GET', url, true);
    request.send();
  }
};
