// http://stackoverflow.com/questions/8567114/how-to-make-an-ajax-call-without-jquery
glift.ajax = {
  get: function(url, callback) {
    request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Content-Type", "text/plain");
    request.onload = function() {
      if (request.readyState == 4) {
        if (request.status == 200) {
          callback(request.responseText);
        } else {
          // We reached our target server, but it returned an error
          console.log('Error:' + request.status + '. ' + request.responseText);
        }
      }
    };
    request.onerror = function() {
      throw new Error(request.responseText);
      // There was a connection error of some sort
    };
    request.send();
  }
  // TODO(kashomon): Add support for POST requests.
};
