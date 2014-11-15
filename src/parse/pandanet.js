/**
 * Parse a pandanet SGF.  Pandanet SGFs, are the same as normal SGFs except that
 * they contain invalid SGF properties.
 */
glift.parse.pandanet = function(string) {
  var replaceRegex = /CoPyright\[[^\]]*\]/;
  var repl = string.replace(replaceRegex, '');
  return glift.parse.sgf(repl);
};
