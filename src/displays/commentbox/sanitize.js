glift.displays.commentbox.sanitizeWhitelist_ = {
  'br': true,
  'b': true,
  'strong': true,
  'i': true,
  'u': true,
  'em': true
};

/**
 * Sanitizes text to prevent XSS. A single pass parser.
 */
glift.displays.commentbox.sanitize = function(text) {
  var outbuffer = [];
  var strbuff = [];
  var states = { DEFAULT: 1, TAG: 2 };
  var whitelist = glift.displays.commentbox.sanitizeWhitelist_;
  var curstate = states.DEFAULT;
  var numBrackets = 0;
  var lt = '&lt;';
  var gt = '&gt;';
  for (var i = 0, len = text.length; i < len; i++) {
    var char = text.charAt(i);
    if (char === '<') {
      curstate = states.TAG;
      numBrackets++;
      if (numBrackets > 1) {
        strbuff.push(lt); 
      }
    } else if (char === '>') {
      numBrackets--;
      if (numBrackets < 0) {
        curstate = states.DEFAULT;
        numBrackets = 0;
        outbuffer.push(gt);
      } else if (numBrackets > 0) { 
        strbuff.push(gt);
      } else if (numBrackets === 0) {
        curstate = states.DEFAULT;
        var strform = strbuff.join('');
        strbuff = [];
        if (strform in whitelist) {
          outbuffer.push('<' + strform + '>');
        } else if (strform.charAt(0) === '/' &&
            strform.substring(1, strform.length) in whitelist) {
          outbuffer.push('<' + strform + '>');
        } else {
          outbuffer.push(lt + strform + gt);
        }
      }
    } else {
      if (curstate === states.TAG) {
        strbuff.push(char);
      } else {
        outbuffer.push(char);
      }
    }
  }
  return outbuffer.join('');
};
