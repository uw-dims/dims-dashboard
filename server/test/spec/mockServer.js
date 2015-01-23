'use strict';

var express = require('express'),
  ROOT_DIR = __dirname + '/../..',
  config = require(ROOT_DIR + '/config'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  session = require('express-session'),
  logger = require(ROOT_DIR + '/utils/logger');

var app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(methodOverride());

// Allows to require files relative to the root in any file
var requireFromRoot = (function(root) {
  return function(resource) {
    return require(root+'/'+resource);
  }
})(ROOT_DIR);

