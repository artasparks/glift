(function() {
glift.logger = function(logDiv, numMsgs) {
  return new glift.Log(logDiv, numMsgs);
};

glift.Log = function(logDiv, numMsgs) {
  this.name = "#" + logDiv;
  this.num = numMsgs;
  this.curMsgs = 0;
};

glift.Log.prototype.println = function(msg) {
  var modmsg = msg;
  if (glift.util.typeOf(msg) === "array" ||
      glift.util.typeOf(msg) === "object") {
    modmsg = JSON.stringify(msg);
  }
  $('<p>' + modmsg + '</p>').appendTo(this.name);
  this.curMsgs++;
  if (this.curMsgs > this.num) {
    $(this.name).children("p:first").remove();
    this.curMsgs = this.curMsgs - 1;
  }
};

glift.Log.prototype.printv = function() {
  var args = arguments;
  var out = "";
  out = args[0];
  for (var i = 1; i < args.length; i++) {
    out = out + "," + args[i];
  }
  this.println(out);
};

glift.Log.prototype.log = glift.Log.prototype.println;

glift.Log.prototype.printArr = function(arr) {
  for (var i = 0; i < arr.length; i++) {
    this.println(arr[i].toString());
  }
  this.println("----");
};
})();
