# Hooks

Hooks a way for users to integrate with Glift without rewriting parts of the
codebase. In short, they provide users the ability to hook into Glift's
execution flow.

Hooks are sgf-level options.

## The Specified Glift Hooks

* BeforeParse
  function(str, done(parseType, str));

* AfterParse
  function(movetree, done(mt))

* BeforeAddStone
  function(point, color, done(point, color));

* AddStoneResult
  function(flattened, done(flattened));

* Problem Incorrect
  function(point, color);

* Problem Correct
  function(point, color);
;
* Problem Indeterminate
  function(point, color);

* NextSgf
  function(mgr, done(string))

* PreviousSgf
  function(mgr

