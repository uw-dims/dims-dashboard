/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
'use strict';

var uuid = require('node-uuid');

var config = {};

config.appName = 'dims-dashboard';

config.publicHost = process.env.DASHBOARD_PUBLIC_HOST || 'localhost';

config.publicPort = process.env.DASHBOARD_PUBLIC_PORT || '80';

config.uuid = uuid.v4();

config.publicProtocol = process.env.DASHBOARD_PUBLIC_PROTOCOL || 'http';

config.sslOn = config.publicProtocol === 'https' ? true : false;

config.publicOrigin = (config.publicPort === '80') ? config.publicProtocol + '://' + config.publicHost
  : config.publicProtocol + '://' + config.publicHost + ':' + config.publicPort;

config.port = process.env.DASHBOARD_PORT || 3000;

config.env = process.env.DASHBOARD_NODE_ENV || 'development';

config.envLogLevel = config.env === 'development' ? 'debug' : 'info';

// Can use this to override log level defined by environment
config.logLevel = process.env.DASHBOARD_LOG_LEVEL || config.envLogLevel;

config.healthInterval = 1;

// Default is Ubuntu cert location
config.certDir = process.env.CERT_DIRECTORY || '/etc/ssl/certs/';

config.caName = process.env.CA_NAME || 'dims-ca';

config.certName = process.env.CERT_NAME || process.env.DASHBOARD_PUBLIC_HOST || 'localhost';

config.redisHost = process.env.REDIS_HOST || 'localhost';

config.redisPort = process.env.REDIS_PORT || 6379;

config.redisDatabase = process.env.REDIS_DATABASE || 0;

// Need to set these variables if using a real ops-trust db
// User would be...
config.userDBHost = process.env.USER_DB_HOST || 'localhost';
config.userDBUser = process.env.USER_DB_USER || 'dims';
config.userDatabase = process.env.USER_DATABASE || 'ops-trust';
// Some databases may not require a password
config.userDBPass = process.env.USER_DB_PASS || null;

config.sessionTTL = 2 * 60 * 60; //Redis session expiration. 2 hours, in seconds

config.tokenTTL = process.env.DASHBOARD_TOKEN_TTL || config.sessionTTL;

// Passport vars and configs
config.tokenSecret = process.env.DASHBOARD_TOKEN_SECRET || 'djf83UhNH35CDjfjEFM3B9e01viY8fNqz3YXpb25wc0U';
config.tokenAlgorithm = 'HS256';
// Result is seconds
config.tokenIssuer = process.env.DASHBOARD_PUBLIC_HOST || require('os').hostname();
config.localStrategyConfig = {
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: false
};

config.jwtStrategyConfig = {
  secretOrKey: config.tokenSecret,
  passReqToCallback: false
};

config.googleClientId = process.env.GOOGLE_CLIENT_ID;
config.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
config.googleURL = '/auth/google';
config.googleCallback = '/auth/google/callback';
config.googleCallbackURL = config.publicOrigin + config.googleCallback;
config.googleConnectURL = '/connect/google';
config.googleConnectCallback = '/connect/google/callback';
config.googleConnectCallbackURL = config.publicOrigin + config.googleConnectCallback;

config.googleStrategyConfig = {
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: config.googleCallbackURL,
  passReqToCallback: true
};

config.googleAuthzStrategyConfig = {
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: config.googleConnectCallbackURL,
  passReqToCallback: true
};


config.sessionSecret = process.env.DASHBOARD_SESSION_SECRET || '3xueis763$%STID47373deC!!QUsT8J4$';

config.cookieSecret = process.env.DASHBOARD_COOKIE_SECRET || 'Xu9J35bq!5#kNY*n3v04aSPxoURx98wQZW';

config.passSecret = process.env.DASHBOARD_PASS_SECRET || '84jd$#lk903jcy2AUEI2j4nsKLJ!lIY';

config.bin = '/opt/dims/bin/';

config.dimsenvbin = '/opt/dims/envs/dimsenv/bin/';

config.rpcbin = config.dimsenvbin;

config.rpcPath = '/opt/dims/src/prisem/rpc';

config.rpcServer = process.env.RABBITMQ_HOST || 'rabbitmq.prisem.washington.edu';

config.rpcUser = process.env.RABBITMQ_DEFAULT_USER || 'rpc_user';

config.rpcPass = process.env.RABBITMQ_DEFAULT_USER_PASS || 'rpcm3pwd';

config.rpcPort = process.env.RABBITMQ_PORT  || '5672';

config.mapfile = '/etc/ipgrep_networks.txt';

config.data = '/opt/dims/data/dims-sample-data/';

config.serverPath = __dirname;


// /opt/dims/data in the Dashboard container will map to host
// /data/dashboard
config.userDataPath = '/opt/dims/data/dashboard/';
config.dashboardDataPath = '/opt/dims/data/dashboard/data/';
config.uploadPath = '/opt/dims/data/dashboard/upload/';
config.logmonPath = '/opt/dims/data/logmon/';


config.directoryMapping = {
  'ip_lists': config.userDataPath + 'ipFiles/',
  'map_files': config.userDataPath + 'mapFiles/',
  'data_files': config.userDataPath + 'dataFiles/',
  'site_resources': config.dashboardDataPath + 'siteResources/',
  'site_data': config.dashboardDataPath + 'siteData/'
};

config.defaultMapping = {
  'default_data': config.data
};

config.rpcQueueNames = {
  'cifbulk': 'cifbulk_v1',
  'anon': 'anon',
  'rwfind': 'rwfind',
  'crosscor': 'crosscor'
};

config.defaultTheme = process.env.DASHBOARD_DEFAULT_THEME || 'light';

config.defaultUserSettings = {
  'anonymize': false,
  'rpcDebug': true,
  'rpcVerbose': true,
  'cifbulkQueue': 'cifbulk_v1',
  'theme': config.defaultTheme,
  'userExternals': []
};

config.defaultSiteSettings = {
  'siteHeadline': 'University of Washington DIMS',
  'homePageText': '',
  'iconFile': 'UW-logo.png',
  'siteLogo': 'UW-logo.png'
};

// The attributes we are tracking
config.defaultAttributes = ['cidr', 'domain', 'tlp'];
config.tlpValues = {
  'red': 'red',
  'green': 'green',
  'amber': 'amber'
};

config.defaultRedisTypes = {
  'hash': 'hash',
  'string': 'string',
  'set': 'set',
  'sortedSet': 'zset'
};

config.maxUploadFileNum = 10;
config.maxUploadFileSize = 39273942;

config.serverKey = config.certDir + config.certName + '.key';
config.serverCrt = config.certDir + config.certName + '.crt';
config.serverCa = config.certDir + config.caName + '.crt';

// Sockets configuration
// receive: true if socket listening for client events
// send: true if socket sends to client
// publish: true if sockets emits publish event when receiving
config.sockets = {
  'chat': {
    'ioPath': '/chat',
    'receive': true,
    'send': true,
    'publish': true
  },
  'logs': {
    'ioPath': '/logs',
    'receive': false,
    'send': true,
    'publish': false
  },
  'devops': {
    'ioPath': '/devops',
    'receive': false,
    'send': true,
    'publish': false
  },
  'test': {
    'ioPath': '/test',
    'receive': false,
    'send': true,
    'publish': false
  },
  'health': {
    'ioPath': '/health',
    'receive': false,
    'send': true,
    'publish': false
  },
  'dimstr': {
    'ioPath': '/dimstr',
    'receive': false,
    'send': true,
    'publish': false
  }
};

config.fanoutExchanges = {
  'chat': {
    'name': 'chat',
    'durable': false,
    'subscribe': true,
    'publish': true,
    'save': false
  },
  'logs': {
    'name': 'logs',
    'durable': false,
    'subscribe': true,
    'publish': true,
    'save': true
  },
  'devops': {
    'name': 'devops',
    'durable': true,
    'subscribe': true,
    'publish': false,
    'save': true
  },
  'test': {
    'name': 'test',
    'durable': true,
    'subscribe': true,
    'publish': false,
    'save': true
  },
  'health': {
    'name': 'health',
    'durable': true,
    'subscribe': true,
    'publish': false,
    'save': true
  },
  'dimstr': {
    'name': 'dimstr',
    'durable': true,
    'subscribe': true,
    'publish': false,
    'save': true
  }
};

config.appLogExchange = 'logs';
config.healthExchange = 'health';

config.healthID = 'dashboard';
config.messagingHealthID = 'messaging';

var uuidSet = function uuidSet() {
  return {
    dashboard: uuid.v4(),
    redis: uuid.v4(),
    postgresql: uuid.v4(),
    messaging: uuid.v4()
  };
};

config.UUIDs = uuidSet();


module.exports = config;
