'use strict';

var bowerJson = require('bower-json');
var url = require('url');
var path = require('path');
var cors = require('cors');
var express = require('express');
var app = express();

// setup GitHubApi
var GitHubApi = require('github');
var github = new GitHubApi({
  version: '3.0.0',
  debug: false
});

// setup Resolver
var Resolver = require('./lib/Resolver'),
    resolver = new Resolver({}, github);

// setup Loader
var Loader = require('./lib/Loader'),
    loader = new Loader({
      debug: console.log
    }, github, resolver);

// configure
var config;
config = {
  port: process.env.PORT || 3333
};

// serve demo as /
app.get('/', function(req, res) {
  res.sendfile(path.join(__dirname, 'demo/demo.html'));
});

app.get('/demo.css', function(req, res) {
  res.sendfile(path.join(__dirname, 'demo/demo.css'));
});

app.use('/bower_components', express.static('demo/fake_components'));

// allow CORS
app.use(cors({
  allowedOrigins: ['*']
}));

app.get('/*', function(req, res) {
  var endpoint = parseUrl(req.url);
  var registryComponent = resolver.lookup(endpoint.path);

  if(endpoint.path.indexOf('bower_components') > 0) {
    console.log('ENDPOINT failed', endpoint.name);
    res.sendStatus(404);
    res.end();
  }

  if(!registryComponent) {
    res.redirect(302, path.join('../bower_components', endpoint.path));
    res.end();
    return;
  }

  loader.load(endpoint)
  .then(function(fileContent) {
    res.send(fileContent);
    res.end();
  })
  .catch(function(e) {
    res.sendStatus(404);
    res.end();
  });

});

app.listen(config.port);

function parseUrl(value, base) {
  base = base || '/';
  var u = url.parse(value);
  var pathname = u.pathname;
  if(pathname.indexOf('base') === 0) {
    pathname = pathname.slice(pathname.indexOf('base'));
  }

  if(pathname.indexOf('/')===0) {
    pathname = pathname.slice(1);
  }

  return {
    path: pathname,
    version: 'master'
  };
}
