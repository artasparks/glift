/*
 * Peg grammar for SGF files.
 *
 * To 'use', generate the Javascript with pegjs (via, hopefully depgen.py) and
 * then call glift.sgf.parser.parse(...)
 */
Start = '(;' props:Tokens children:Variations ')' {
  return glift.rules.movenode(glift.rules.properties(props), children).renumber();
}

Variations =  '(' var1:Moves ')' white:WhiteSpace? '(' var2:Moves ')' whiteAlso:WhiteSpace? more:MoreVars { return [var1, var2].concat(more); }
    /  move:Moves { return (move === undefined ? [] : [move]); }

MoreVars = '(' move:Moves ')' white:WhiteSpace? more:MoreVars {
    return [move].concat(more); }
    / '' { return []; }

Moves = ';' props:Tokens children:Variations {
          return glift.rules.movenode(glift.rules.properties(props), children);
        }
    / '' { return undefined; }

Tokens = token: TokenName '[' propdata: Data ']' white:WhiteSpace? more:MoreData whiteAlso:WhiteSpace? tokens:MoreTokens {
  tokens[token] = [propdata].concat(more);
  return tokens;
}

MoreTokens = Tokens
    / '' { return {}; }

Data = props:(( '\\]' / [^\]])*) {
  if (!props) {
    return "";
  } else {
    return props.join("");
  }
}

MoreData = '[' propdata: Data ']' white:WhiteSpace? more: MoreData {
    return [propdata].concat(more); }
    / '' { return []; }

TokenName = name:([a-zA-Z] [a-zA-Z] / [a-zA-Z]) {
  if (name.length === 1) return name[0];
  else return name.join("").toUpperCase();
}

WhiteSpace = (" " / '\n')*
