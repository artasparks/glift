(function() {
otre.logger = function(logDiv, numMsgs) {
  return new otre.Log(logDiv, numMsgs);
};

otre.Log = function(logDiv, numMsgs) {
  this.name = "#" + logDiv;
  this.num = numMsgs;
  this.curMsgs = 0;
};

otre.Log.prototype.println = function(msg) {
  var modmsg = msg;
  if (otre.util.typeOf(msg) === "array" ||
      otre.util.typeOf(msg) === "object") {
    modmsg = JSON.stringify(msg);
  }
  $('<p>' + modmsg + '</p>').appendTo(this.name);
  this.curMsgs++;
  if (this.curMsgs > this.num) {
    $(this.name).children("p:first").remove();
    this.curMsgs = this.curMsgs - 1;
  }
};

otre.Log.prototype.printv = function() {
  var args = arguments;
  var out = "";
  out = args[0];
  for (var i = 1; i < args.length; i++) {
    out = out + "," + args[i];
  }
  this.println(out);
};

otre.Log.prototype.log = otre.Log.prototype.println;

otre.Log.prototype.printArr = function(arr) {
  for (var i = 0; i < arr.length; i++) {
    this.println(arr[i].toString());
  }
  this.println("----");
};
})();
