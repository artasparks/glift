/**
 * Parse a pandanet SGF.  Pandanet SGFs, are the same as normal SGFs except that
 * they contain invalid SGF properties.
 */
// TODO(kashomon): Delete and fold into SGF parsing. this is really a special
// case of FF3, which should be supported by Glift.
glift.parse.pandanet = function(string) {
  var replaceRegex = /CoPyright\[[^\]]*\]/;
  var repl = string.replace(replaceRegex, '');
  return glift.parse.sgf(repl);
};
