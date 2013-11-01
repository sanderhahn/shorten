var http = require('http')
var url_parse = require('url').parse
var querystring = require('querystring')
var fs = require('fs')

var Shorten = require('./lib/shorten')
var shorten = new Shorten('shorten.db')

var port = process.env.PORT || process.env.VMC_APP_PORT || 3000

function index(res) {
  res.writeHead(200, {'Content-Type': 'text/html'})
  fs.createReadStream('./public/index.html').pipe(res)
}

function not_found(res) {
  res.writeHead(404, {'Content-Type': 'text/html'})
  res.end('<h1>Not Found</h1>')
}

function handle_shorten(req, res) {
  var postdata = ''
  req.on('data', function(chunk) {
    postdata += chunk.toString()
  });
  req.on('end', function() {
    var url = querystring.parse(postdata).url
    if(url == null) {
      res.writeHead(422, {'Content-Type': 'text/html'})
      res.end('<h1>Input url missing</h1>')
    } else {
      shorten.shorten(url, function(short) {
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({url: url, short: 'http://' + req.headers.host + '/' + short}))
      })
    }
  })
}

function handle_redirect(req, res, otherwise) {
  shorten.lookup_short(req.url.pathname.substr(1), function(full) {
    if(full) {
      res.writeHeader(302, {'Location': full})
      res.end()
    } else {
      otherwise(req, res)
    }
  })
}

function start_server(port) {
  http.createServer(function(req, res) {
    req.url = url_parse(req.url, true)
    handle_redirect(req, res, function() {
      if(req.url.pathname == '/') {
        index(res)
      } else if(req.url.pathname == '/shorten' && req.method == 'POST') {
        handle_shorten(req, res)
      } else {
        not_found(res)
      }
    })
  }).listen(port, function() {
    console.log('Server started at port: %s', port)
  })
}

start_server(port)
