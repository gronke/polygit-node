'use strict';

var bowerJson = require('bower-json');
var url = require('url');
var cors = require('cors');
var express = require('express');
var app = express();
var GitHub = require('./lib/GitHub'),
    gitHub = new GitHub();

var config = {
  port: process.env.PORT || 3333
};

app.use(cors({
  allowedOrigins: ['*']
}));

var proxy = require('express-http-proxy');

app.get('/', express.static('demo.html'));

app.get('*', proxy('https://raw.githubusercontent.com', {
  filter: function(req, res) {
     return req.method == 'GET';
  },
  forwardPath: function(req, res) {
    var endpoint = parseUrl(req.url);
    var targetUrl = '/' + gitHub.getFullPath(endpoint);
    return targetUrl;
  }
}));

app.listen(config.port);

function parseUrl(value, base) {
  base = base || '/';
  var u = url.parse(value);
  var pathname = u.pathname;
  if(pathname.indexOf('base') === 0) {
    pathname = pathname.slice(pathname.indexOf('base'));
  }

  var paths = pathname.slice(1).split('/');
  var componentName = paths.splice(0, 2).join('/');

  var file = paths.join('/');
  return {
    name: componentName,
    version: 'master',
    file: file
  }
}
