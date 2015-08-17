// This is not included in the compiled otre client file.
if (testdata === undefined) var testdata = {};

testdata.sgfs = {
  descriptionTest: "(;GM[1]C[Try these Problems out!])",
  base:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]\n" +
    "RU[Japanese]SZ[19]KM[0.00]\n" +
    "PW[White]PB[Black])",

  escapedComment: "(;GM[1]FF[4]C[Josh[1k\\]: Go is Awesome!])",

  veryeasy:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]\n" +
    "C[Here's a basic example problem]" +
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
    "[re]LB[pb:3][qb:2][pc:B][qc:1][pd:A]TR[qd][qe]SQ[rd:re]\n" +
    ";B[sa]TR[qa]C[bar]\n" +
    ";W[fi]SQ[ab]C[foo])",

  trivialproblem:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]\n" +
    "RU[Japanese]SZ[19]KM[0.00]\n" +
    "PW[White]PB[Black]GB[1]" +
    "C[Here's an example diagram. I have marked 1 on the diagram. " +
    "Let's pretend it was white's last move.  Think on this move, since " +
    "it may be a problem in the near future!]" +
    "LB[pb:1]" +
    "AW[pb][mc][pc][qd][rd][qf][pg][qg]" +
    "AB[jc][oc][qc][pd][pe][pf])",

  realproblem:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]\n" +
    "RU[Japanese]SZ[19]KM[0.00]\n" +
    "PW[White]PB[Black]AW[pb][mc][pc][qd][rd][qf][pg][qg]\n" +
    "AB[jc][oc][qc][pd][pe][pf]\n" +
    "C[Look Familiar?]" +
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
        ";B[mc]C[White dies.]GB[1])\n" +
      "(;W[mc]\n" +
        "(;B[oa]\n" +
        ";W[nd]\n" +
        ";B[pb]C[White lives])\n" +
        "(;B[nd]\n" +
          ";W[nc]\n" +
          ";B[oa]C[White dies.]GB[1]))\n" +
      "(;W[nd]\n" +
        ";B[mc]\n" +
        ";W[oa]\n" +
        ";B[nc]C[White dies.]GB[1]))\n" +
    "(;B[nc]\n" +
      ";W[mc]C[White lives])\n" +
    "(;B[]C[A default consideration]\n" +
      ";W[mc]C[White lives easily]))",

  capturetest:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]" +
    "RU[Japanese]SZ[19]KM[0.00]" +
    "PW[White]PB[Black]AW[sa][qb][rb][qc][rc]AB[qa][ra][pb][pc][sc][qd][rd]" +
    ";B[sb]C[Woo!])",

  marktest:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]" +
    "RU[Japanese]SZ[19]KM[0.00]" +
    "C[[Mark Test\\]]" +
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
    ")",

  twoOptions: "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]" +
    "RU[Japanese]SZ[19]KM[0.00]" +
    "PW[White]PB[Black]EV[ALL_CORRECT]AW[oc][pe]AB[mc][qd]C[What are the normal ways black follows up this position?]" +
    "(;B[pd]C[Correct]" +
    ";W[od]" +
    ";B[oe])" +
    "(;B[qe]C[Correct]" +
    ";W[pf]" +
    ";B[qg]))",

  passingExample: "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]" +
    "RU[Japanese]SZ[19]KM[0.00]" +
    "PW[White]PB[Black]" +
    ";B[]" +
    ";AW[qc]AB[pd]C[How should White respond?]" +
    "(;W[pc]" +
    ";B[od]C[Correct])" +
    "(;W[qd]" +
    ";B[pe]C[Correct]))",

  gogameguruHard: "(;GM[2]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]RU[Japanese]SZ[19]KM[0.00]C[A Problem from GoGameGuru]AW[po][qo][ro][so][np][op][pq][nr][pr][qr][rs]AB[qm][on][pn][oo][pp][qp][rp][sp][qq][rr][qs](;B[sr](;W[rq];B[sq];W[ps];B[rn]C[Correct])(;W[ps](;B[rn];W[rq];B[sq];W[qs](;B[sn]C[Correct])(;B[qn]C[Correct]))(;B[qn];W[rq];B[sq];W[qs];B[rn]C[Correct])(;B[sn];W[rq];B[sq];W[qs];B[rn]C[Correct])))(;B[sq];W[ps](;B[rn];W[sr];B[ss]C[It's a ko, but black can do better.])(;B[sr];W[qs];B[rn];W[ss])(;B[qn];W[sr];B[ss]C[It's a ko, but black can do better.])(;B[sn];W[sr];B[ss]C[It's a ko, but black can do better.]))(;B[ss];W[sq];B[rq];W[ps](;B[rn];W[rs]C[It's a ko, but black can do better.])(;B[qn];W[rs]C[It's a ko, but black can do better.])(;B[sn];W[rs]C[It's a ko, but black can do better.]))(;B[rq];W[ps](;B[sr];W[qs](;B[rn];W[ss])(;B[qn];W[ss]))(;B[rn];W[sr])(;B[qn];W[sr]))(;B[rn];W[sq])(;B[qn];W[sq])(;B[sn];W[sq]))",

  leeGuGame6:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]" +
    "RU[Chinese]SZ[19]KM[7.50]TM[14100]OT[5x60 byo-yomi]" +
    "GN[Lee-Sedol-vs-Gu-Li-20140525]PW[Lee Sedol]PB[Gu" +
    "Li]WR[9d]BR[9d]DT[2014-07-27]EV[MLily Gu vs Lee Jubango]RO[Game" +
    "6]PC[Liuan, Anhui, China]SO[http://gogameguru.com/]RE[W+Resign] ;B[pd]" +
    ";W[dp] ;B[qp] ;W[dc] ;B[oq] ;W[qf] ;B[pi] ;W[nd] ;B[pf] ;W[qc] ;B[pc]" +
    ";W[pg] ;B[pe] ;W[ph] ;B[qi] ;W[ng] ;B[re] ;W[ni] ;B[rg] ;W[ce] ;B[jd]" +
    ";W[hc] ;B[ne] ;W[nk] ;B[mh] ;W[nh] ;B[me] ;W[fq] ;B[kp] ;W[pk] ;B[jb]" +
    ";W[dj] ;B[cn] ;W[bp] ;B[bj] ;W[jp] ;B[jq] ;W[cj] ;B[bk] ;W[bi] ;B[dl]" +
    ";W[iq] ;B[ir] ;W[ip] ;B[hr] ;W[kq] ;B[jr] ;W[lq] ;B[lp] ;W[mp] ;B[mo]" +
    ";W[np] ;B[mq] ;W[nq] ;B[mr] ;W[no] ;B[ln] ;W[mn] ;B[lo] ;W[lm] ;B[lr]" +
    ";W[el] ;B[em] ;W[cl] ;B[ep] ;W[eq] ;B[ek] ;W[fl] ;B[dk] ;W[ck] ;B[fk]" +
    ";W[fi] ;B[do] ;W[cp] ;B[mm] ;W[nn] ;B[ml] ;W[om] ;B[km] ;W[ll] ;B[mk]" +
    ";W[kl] ;B[lj] ;W[qn] ;B[ol] ;W[ok] ;B[pl] ;W[ql] ;B[nl] ;W[rk] ;B[qj]" +
    ";W[qk] ;B[pm] ;W[pn] ;B[ro] ;W[rn] ;B[jk] ;W[il] ;B[ik] ;W[hk] ;B[jl]" +
    ";W[gk] ;B[fm] ;W[kn] ;B[kr] ;W[jm] ;B[hm] ;W[gl] ;B[gm] ;W[im] ;B[hl]" +
    ";W[hj] ;B[gi] ;W[fj] ;B[in] ;W[kk] ;B[ii] ;W[kj] ;B[ij] ;W[ki] ;B[gj]" +
    ";W[lh] ;B[fc] ;W[ic] ;B[dd] ;W[cd] ;B[db] ;W[cc] ;B[ec] ;W[jc] ;B[kc]" +
    ";W[kd] ;B[lc] ;W[fe] ;B[cb] ;W[bb] ;B[gd] ;W[ge] ;B[hd] ;W[id] ;B[he]" +
    ";W[je] ;B[hf] ;W[gg] ;B[gh] ;W[hg] ;B[ig] ;W[if] ;B[jg] ;W[kf] ;B[fg]" +
    ";W[gf] ;B[de] ;W[ef] ;B[df] ;W[eg] ;B[ba] ;W[ab] ;B[gb] ;W[hb] ;B[ga]" +
    ";W[cf] ;B[dg] ;W[eh] ;B[kg] ;W[lf] ;B[dh] ;W[ed] ;B[lg] ;W[mg] ;B[mf]" +
    ";W[ee] ;B[le] ;W[gc] ;B[fd] ;W[ih] ;B[kh] ;W[jh]C[http://gogameguru.com/])",

  yearbookExample:
    "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]" +
    "RU[Japanese]SZ[19]KM[6.50]" +
    "PW[Lee Sedol]PB[Gu Li]WR[9d]BR[7d]DT[2004-11-16]EV[9th Samsung Cup]RO[Semifinal]PC[Ulsan]SO[https://gogameguru.com/]RE[W+Resign]" +
    ";B[qd] ;W[dd] ;B[pq] ;W[oc] ;B[dp] ;W[po] ;B[pe] ;W[md] ;B[qm] ;W[qq] ;B[qp]" +
    ";W[pp] ;B[qo] ;W[qn] ;B[pn] ;W[rn] ;B[rq] ;W[qr] ;B[ro] ;W[rm] ;B[oq] ;W[np]" +
    ";B[rr] ;W[ql] ;B[pm] ;W[pl] ;B[nm] ;W[op] ;B[ol] ;W[pj] ;B[qh] ;W[ok] ;B[nk]" +
    ";W[nj] ;B[mk] ;W[so] ;B[rp] ;W[mm] ;B[nn] ;W[mn] ;B[mj] ;W[ni] ;B[mi] ;W[mh]" +
    ";B[lh] ;W[mg] ;B[lg] ;W[on] ;B[om] ;W[mf] ;B[jp] ;W[km] ;B[jj] ;W[im] ;B[lp]" +
    ";W[nq] ;B[pr] ;W[or] ;B[qs] ;W[no] ;B[nl] ;W[lo] ;B[gp] ;W[jh] ;B[ji] ;W[ih]" +
    ";B[hj] ;W[fm] ;B[kf] ;W[if] ;B[kd] ;W[id] ;B[fj] ;W[dm] ;B[ck] ;W[kk] ;B[le]" +
    ";W[of] ;B[cf] ;W[dh] ;B[hg] ;W[hh] ;B[gh] ;W[gg] ;B[fh] ;W[hi] ;B[ik] ;W[gi]" +
    ";B[fi] ;W[gj] ;B[gk] ;W[fk] ;B[gl] ;W[fl] ;B[gm] ;W[gn] ;B[hn] ;W[hm] ;B[fn]" +
    ";W[go] ;B[fo] ;W[ho] ;B[il] ;W[ej] ;B[jn] ;W[jm] ;B[in] ;W[hp] ;B[gq] ;W[jo]" +
    ";B[io] ;W[ip] ;B[ko] ;W[kn] ;B[jo] ;W[jq] ;B[kp] ;W[hr] ;B[kr] ;W[gr] ;B[jr]" +
    ";W[fp] ;B[fq] ;W[fr] ;B[eq] ;W[ir] ;B[er] ;W[lr] ;B[mr] ;W[lq] ;B[kq] ;W[mq]" +
    ";B[iq] ;W[hq] ;B[fs] ;W[ks] ;B[is] ;W[mp] ;B[fg] ;W[gf] ;B[ff] ;W[en] ;B[eo]" +
    ";W[do] ;B[ep] ;W[co] ;B[gs] ;W[jq] ;B[ge] ;W[hf] ;B[iq] ;W[hl] ;B[hk] ;W[jq]" +
    ";B[jg] ;W[js] ;B[ig] ;W[cq] ;B[cp] ;W[bp] ;B[br] ;W[fd] ;B[cd] ;W[cc] ;B[de]" +
    ";W[bd] ;B[dl] ;W[ek] ;B[cm] ;W[bn] ;B[bq] ;W[cj] ;B[bj] ;W[ci] ;B[bm] ;W[bi]" +
    ";B[ed] ;W[ce] ;B[dc] ;W[ee] ;B[cd] ;W[jf] ;B[kg] ;W[dd] ;B[ei] ;W[dj] ;B[cd]" +
    ";W[cr] ;B[ap] ;W[dd] ;B[df] ;W[ec] ;B[dg] ;W[bf] ;B[bg] ;W[ag] ;B[ah] ;W[af]" +
    ";B[fe] ;W[bh] ;B[gd] ;W[qg] ;B[rg] ;W[qf] ;B[rf] ;W[qc] ;B[rk] ;W[rl] ;B[qi]" +
    ";W[rj] ;B[qj] ;W[qk] ;B[oh] ;W[og] ;B[oi] ;W[oj] ;B[ri] ;W[sk] ;B[rd] ;W[rc]" +
    ";B[od] ;W[pc] ;B[me] ;W[nh] ;B[si] ;W[ao] ;B[bo]" +
    ";W[sd]C[### 9th Samsung Cup - Game One" +
    "" +
    "**November 16 2004, Ulsan, Korea: 9th Samsung Cup Semifinals, Game One**" +
    "" +
    "*Gu Li 7d (black) vs Lee Sedol 9d*" +
    "" +
    "White 38 was painful for Black." +
    "" +
    "White 76 was a mistake." +
    "" +
    "Black 125 was the losing move. Black should have played Black 125 at Black 145 instead." +
    "" +
    "**228 moves: White won by resignation.**])",
};
