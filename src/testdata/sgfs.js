// This is not included in the compiled otre client file.
if (testdata === undefined) var testdata = {};

testdata.sgfs = {
  base:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]\n" +
    "RU[Japanese]SZ[19]KM[0.00]\n" +
    "PW[White]PB[Black])",

  veryeasy:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]\n" +
    "RU[Japanese]SZ[19]KM[0.00]\n" +
    "PW[j]PB[j]AW[ef]\n" +
    ";B[pd]\n" +
    ";W[cc]\n" +
    ";B[qf]\n" +
    ";W[nc]\n" +
    ";B[dd]\n" +
    ";W[pb])",

  easy:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]" +
    "RU[Japanese]SZ[19]KM[0.00]" +
    "PW[White]PB[Black]AW[pa][pb][sb][pc][qc][sc][qd][rd][sd]AB[oa][qa][ob][rb][oc][rc][pd][pe][qe][re][se]C[\\\\] Black to Live]" +
    "" +
    "(;B[sa];W[ra]C[Ko])" +
    "(;B[ra]C[Correct];W[]C[And if white thinks it is seki?]" +
    "  (;B[qb]C[Correct.];W[sa];B[rb]C[Black lives])" +
    "  (;B[sa];W[qb];B[ra];W[rb]C[White Lives])" +
    ")" +
    "(;B[qb];W[ra]C[White lives]))",

  marky:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]\n" +
    "RU[Japanese]SZ[19]KM[0.00]\n" +
    "PW[White]PB[Black]CR[rb][rc][re]AB[pc][qd][pe]" +
    "[re]LB[pb:3][qb:2][pc:B][qc:1][pd:A]TR[qd][qe]SQ[rd]\n" +
    ";B[sa]TR[qa]C[bar]\n" +
    ";W[fi]SQ[ab]C[foo])",

  trivialproblem:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]\n" +
    "RU[Japanese]SZ[19]KM[0.00]\n" +
    "PW[White]PB[Black]GB[1]AW[pb][mc][pc][qd][rd][qf][pg][qg]" +
    "AB[jc][oc][qc][pd][pe][pf])",

  realproblem:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]\n" +
    "RU[Japanese]SZ[19]KM[0.00]\n" +
    "PW[White]PB[Black]AW[pb][mc][pc][qd][rd][qf][pg][qg]\n" +
    "AB[jc][oc][qc][pd][pe][pf]\n" +
    "(;B[ob]C[Bad style.]\n" +
    ";W[qb]\n" +
    "(;B[nd]C[White's stone can easily escape.])\n" +
    "(;B[me]C[Lots of bad aji.]))\n" +
    "(;B[nc]\n" +
    "(;W[qb]\n" +
    ";B[md]C[Correct]GB[1])\n" +
    "(;W[md]\n" +
    ";B[qb]GB[1]C[White loses his corner])))",

  complexproblem:
    "(;GM[1]FF[4]CA[UTF-8]AP[Glift]ST[2]\n" +
    "RU[Japanese]SZ[19]KM[0.00]\n" +
    "C[Black to play. There aren't many options " +
    "to choose from, but you might be surprised at the answer!]" +
    "PW[White]PB[Black]AW[pa][qa][nb][ob][qb][oc][pc][md][pd][ne][oe]\n" +
    "AB[na][ra][mb][rb][lc][qc][ld][od][qd][le][pe][qe][mf][nf][of][pg]\n" +
    "(;B[mc]\n" +
    ";W[nc]C[White lives.])\n" +
    "(;B[ma]\n" +

    "(;W[oa]\n" +
      ";B[nc]\n" +
      ";W[nd]\n" +
      ";B[mc]GB[1]C[White dies.])\n" +

    "(;W[mc]\n" +
      "(;B[oa]\n" +
        ";W[nd]\n" +
        ";B[pb]C[White lives])\n" +
      "(;B[nd]\n" +
        ";W[nc]\n" +
        ";B[oa]GB[1]C[White dies.]))\n" +

    "(;W[nd]\n" +
      ";B[mc]\n" +
      ";W[oa]\n" +
      ";B[nc]GB[1]C[White dies.])))",

  capturetest:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]" +
    "RU[Japanese]SZ[19]KM[0.00]" +
    "PW[White]PB[Black]AW[sa][qb][rb][qc][rc]AB[qa][ra][pb][pc][sc][qd][rd]" +
    ";B[sb]C[Woo!])",

  marktest:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]" +
    "RU[Japanese]SZ[19]KM[0.00]" +
    "PW[White]PB[Black]" +
    "AW[na][oa][pa][qa][ra][sa][ka][la][ma][ja]" +
    "AB[nb][ob][pb][qb][rb][sb][kb][lb][mb][jb]" +

    // Label
    "LB[pa:A][ob:2][pb:B][pc:C][pd:D]" +
    "[oa:1][oc:3][ne:9][oe:8][pe:7][qe:6][re:5][se:4]" +
    "[nf:15][of:14][pf:13][qf:11][rf:12][sf:10]" +
    "[ng:22][og:44][pg:100]" +
    "[ka:a][kb:b][kc:c][kd:d][ke:e][kf:f][kg:g]" +

    // Unicode labels [japanese unicode numbers
    "[ma:\u4e00][mb:\u4e8c][mc:\u4e09][md:\u56db][me:\u4e94]" +
    "[la:\u516d][lb:\u4e03][lc:\u516b][ld:\u4e5d][le:\u5341]" +
    // Mark
    "MA[na][nb][nc]" +
    // Circle
    "CR[qa][qb][qc]" +
    // Triangle
    "TR[sa][sb][sc]" +
    // Square
    "SQ[ra][rb][rc]" +
    ")"
};
