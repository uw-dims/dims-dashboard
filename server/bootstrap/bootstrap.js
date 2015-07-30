'use strict';

// File: server/bootstrap/bootstrap.js

// This will bootstrap a new instance with sample data and
// mitigation demo

// Location of sample data must be at

var q = require('q');
var fs = require('fs');


var logger = require('../../utils/logger');
var KeyGen = require('../../models/keyGen');
var c = require('../../config/redisScheme');
var q = require('q');
var fs = require('fs');
var config = require('../../config/config');
var anonymize = require('../../services/anonymize');
var ChildProcess = require('../../services/childProcess');

var redisDB = require('../../utils/redisDB');
var db = require('../../utils/redisUtils')(redisDB);
var Ticket = require('../../models/ticket')(db);

// Users for demo
var users = ['lparsons', 'dittrich', 'eliot', 'parksj'];

var ticketConfig = [
  {
    user: users[0],
    type: 'data'
  },

  {
    user: users[1],
    type: 'analysis'
  },
  {
    user: users[2],
    type: 'data'
  },
  {
    user: users[3],
    type: 'analysis'
  }
];

var topicConfig = [
  {
    topic: 'storage:logcenter:logcenter-sizes-2.txt',
    dataType: 'hash',
    data: 'data/prisemTestData/logcenter-sizes-2.txt',
    shortDesc: 'Logcenter data usage vs. date',
    description: '',
    displayType: 'double-time-series'
  },
  {

    topic: 'storage:silk:silk-sizes-2.txt',
    dataType: 'hash',
    data: 'data/prisemTestData/silk-sizes-2.txt',
    shortDesc: 'SiLK data usage vs. date',
    description: '',
    displayType: 'double-time-series'
  },
  {
    topic: 'cif:65% Confidence',
    dataType: 'hash',
    data: 'data/prisemTestData/testcif1.txt',
    shortDesc: 'CIF 65% confidence results JSON',
    description: '',
    displayType: 'cif'
  },
  {
    topic: 'cif:APT 1 intrusion set',
    dataType: 'hash',
    data: 'data/prisemTestData/testcif3a.txt',
    shortDesc: 'APT 1 intrusion set obtained via cross-correlation, testcif3',
    description: '',
    displayType: 'cif'
  },
  {
    topic: 'cif:APT 1 intrusion search',
    dataType: 'hash',
    data: 'data/prisemTestData/testcif3.txt',
    shortDesc: 'APT 1 intrusion set CIF search results, testcif3',
    description: '',
    displayType: 'cif'
  }
]

var ROOT_DIR = __dirname + '/../../';

logger.debug('ROOT_DIR is ', ROOT_DIR);
