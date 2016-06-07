
var http = require('http');


var p1 = [
  '(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]',
  'RU[Japanese]SZ[19]KM[0.00]',
  'PW[White]PB[Black]AW[pa][pb][qb][rb][sb]AB[oa][ob][pc][qc][rc][sc][od]',
  ';B[ra]C[Correct])',
].join('\n');

var p2 = [
  '(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]',
  'RU[Japanese]SZ[19]KM[0.00]',
  'PW[White]PB[Black]AW[pa][pb][qc][qd][rd][sd]AB[qa][qb][rb][rc][sc]',
  ';B[sa]C[Correct. Black makes two eyes.])',
].join('\n');


var handler = function(req, res) {
  if (req.url == '/problem' && req.method == 'GET') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(p1);
  } else if (req.url == '/problemresult' && req.method == 'POST') {
    var body = '';
    req.on('data', function(data) {
      body += data;
    });
    req.on('end', function() {
      console.log('Response:' + body);
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Response:' + body);
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('No endpoint found for url: ' + req.url + ' and method ' + req.method);
  }
};

http.createServer(handler).listen(1337, "127.0.0.1");

console.log('Server running at http://127.0.0.1:1337/');

