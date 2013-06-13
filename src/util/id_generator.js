glift.util._IdGenerator = function(seed) {
  this.seed  = seed || 0;
};

glift.util._IdGenerator.prototype = {
  next: function() {
    var out = this.seed + "";
    this.seed += 1
    return out;
  }
};

glift.util.idGenerator = new glift.util._IdGenerator(0);
