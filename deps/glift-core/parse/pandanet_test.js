(function() {
  module('glift.parse.pandanetTest');

  var testfile = [
    '(;',
    'GM[1]EV[Internet Go Server game: Namii vs drakula95]',
    'US[Brought to you by IGS PANDANET]',
    'CoPyright[',
    '  Copyright (c) PANDANET Inc. 2014',
    '  Permission to reproduce this game is given, provided proper credit is given.',
    '  No warrantee, implied or explicit, is understood.',
    '  Use of this game is an understanding and agreement of this notice.',
    ']',
    'GN[Namii-drakula95(B) IGS]RE[B+Resign]',
    'PW[Namii]WR[5d?]NW[33]',
    'PB[drakula95]BR[5d?]NB[33]',
    'PC[IGS:  igs.joyjoy.net 6969]DT[2014-11-05]',
    'SZ[19]TM[3600]KM[6.500000]LT[]',
    'RR[Normal]',
    'C[',
    ' Namii 5d?: 143 Have a nice game',
    ' drakula95 5d?: 143 have a nice game',
    ']',
    ';B[qd]BL[3587]',
    ';W[dc]WL[3582]',
    ';B[pp]BL[3570]',
    ';W[dq]WL[3549]',
    ';B[lc]BL[3547]',
    ';W[qn]WL[3401]',
    ';B[qk]BL[3527]',
    ';W[nq]WL[3323]',
    // lot's of moves go here...
    'OS[ajeczka][AriSan][baldur][betterlife][BU2014]',
    '[Crates][Ergo2012][Gardan][gisel88][gogeo]',
    '[GoSuGo][GOvernor][hegethus][Hipcio][Iceape]',
    '[JeffChang][Juippi][kare][kyusama][maek]',
    '[mayeck][mdcl][nekocat][Nilatarion][ojisanshac]',
    '[Oni][pempu][prodi][puerhista][RUBENDARIO]',
    '[Sadiker][sakugo][siskin][Taksimies][Tantares]',
    ')'
  ].join('\n');

  test('Test parse testfile', function() {
    var oldLog = glift.util.logz;
    var parseErrors = [];
    var testLogger = function(msg) {
      parseErrors.push(msg);
    };
    // Patch in a testing logger.
    glift.util.logz = testLogger;

    var f = glift.parse.fromString(testfile, glift.parse.parseType.PANDANET);
    ok(f);
    f.moveDown();
    deepEqual(f.properties().getOneValue('B'), 'qd');
    ok(parseErrors[0].indexOf('NW') > 1);
    ok(parseErrors[2].indexOf('NB') > 1);
    ok(parseErrors[4].indexOf('RR') > 1);
    ok(parseErrors[6].indexOf('OS') > 1);

    // reset the logger
    glift.util.logz = oldLog;
  });
})();
