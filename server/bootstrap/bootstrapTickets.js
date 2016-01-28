'use strict';

var path = require('path');
var _ = require('lodash-compat');
var q = require('q');
var fs = require('fs');

var ROOT_DIR = __dirname + '/../';
var DATA_ROOT = __dirname + '/../../';
var DATA_PATH = path.join(DATA_ROOT, '/initial_data');

console.log(DATA_PATH);

var diContainer = require(path.join(ROOT_DIR, '/services/diContainer'))();
var bluebird = require('bluebird');
var redis = require('redis');

var client = bluebird.promisifyAll(redis.createClient());
bluebird.promisifyAll(client.multi());

diContainer.register('client', client);
diContainer.factory('UserModel', require(path.join(ROOT_DIR, '/models/user')));
diContainer.factory('store', require(path.join(ROOT_DIR, '/models/store')));
diContainer.factory('Ticket', require(path.join(ROOT_DIR, '/models/ticket')));
diContainer.factory('Topic', require(path.join(ROOT_DIR, '/models/topic')));
diContainer.register('Bookshelf', require(path.join(ROOT_DIR, '/utils/bookshelf')));

var UserModel = diContainer.get('UserModel');
var Bookshelf = diContainer.get('Bookshelf');
var Ticket = diContainer.get('Ticket');
var Topic = diContainer.get('Topic');

(function () {
  var bootstrapTickets = {};

  exports.runBootstrap = bootstrapTickets.runBootstrap = function (options) {
    var tg = options[0];
    options = _.drop(options, 1);
    console.log('input users', options);
    console.log('input tg', tg);

    var createOptions = function createOptions (creator, type, name, tg, privacy, description) {
      return {
        creator: creator,
        type: type,
        description: description,
        private: privacy,
        name: name,
        tg: tg
      };
    };

    // Return array of valid users to create tickets for
    var getUsers = function getUsers(options) {
      var users = [];
      return UserModel.Users.forge().fetch()
      .then(function (collection) {
        _.forEach(collection.toJSON(), function (value, key) {
          // If user is in options, then save it
          if (_.includes(options, value.ident)) {
            users.push(value.ident);
          }
        });
        console.log('bootstrap tickets getUsers ', users);
        return users;
      })
      .catch(function (err) {
        throw err;
      });
    };

    var users,
        name = [
          'Suspicious CIDR',
          'Search APT1 intrusion',
          'Flow Analysis 3-2014',
          'Flow Analysis one indicator 1-2014',
          'Flow Analysis 1-2014',
          'Flow Analysis 9-2014 95',
          'Flow Analysis 9-2014 65'
        ];

    var config = [],
          promises = [],
          tickets = [],
          topics = [];

    topics[5] = [
        {
          metadata: {
            name: 'Flow results',
            datatype: 'string',
            description: 'Flow results'
          },
          file: path.join(DATA_PATH, '/data/prisemTestData/testrw2-b.txt')
        },
        {
          metadata: {
            name: 'Malware data',
            datatype: 'string',
            description: 'Malware report - source of suspect IPs'
          },
          file: path.join(DATA_PATH, '/data/prisemTestData/malware65.txt')
        },
        {
          metadata: {
            name: 'Reputation search',
            datatype: 'string',
            description: 'Reputation results from CIF for suspect IPs'
          },
          file: path.join(DATA_PATH, '/data/prisemTestData/testcif1.txt')
        }];

      topics[4] = [
        {
          metadata: {
            name: 'Flow results',
            datatype: 'string',
            description: 'Flow results'
          },
          file: path.join(DATA_PATH, '/data/prisemTestData/testrw3.txt')
        }
      ];

      topics[3] = [
        {
          metadata: {
            name: 'Flow results',
            datatype: 'string',
            description: 'Flow results - searching for 89.248.172.58'
          },
          file: path.join(DATA_PATH, '/data/prisemTestData/testrw6.txt')
        }
      ];

      topics[2] = [
        {
          metadata: {
            name: 'Flow results',
            datatype: 'string',
            description: 'Flow results - 3/8/2014'
          },
          file: path.join(DATA_PATH, '/data/prisemTestData/testrw9.txt')
        },
        {
          metadata: {
            name: 'IPs',
            datatype: 'string',
            description: 'Searching for these suspect IPs'
          },
          file: path.join(DATA_PATH, '/mydata/dataFiles/ips95-20140308.txt')
        },
        {
          metadata: {
            name: 'Mapfile',
            datatype: 'string',
            description: 'Mapping for suspect IPs'
          },
          file: path.join(DATA_PATH, '/mydata/mapFiles/map95-20140308.txt')
        }
      ];
      // cif3
      topics[1] = [
        {
          metadata: {
            name: 'CIF results',
            datatype: 'string',
            description: 'CIF results'
          },
          file: path.join(DATA_PATH, '/data/prisemTestData/testcif3.txt')
        },
        {
          metadata: {
            name: 'Search IPs',
            datatype: 'string',
            description: 'Search Ips'
          },
          file: path.join(DATA_PATH, '/data/prisemTestData/testcif3a.txt')
        },
        {
          metadata: {
            name: 'Netflow report',
            datatype: 'string',
            description: 'Original netflow report correlated to find IPs '
          },
          file: path.join(DATA_PATH, '/mydata/dataFiles/rwfind_201302210110_18463.txt')
        }
      ];
      topics[0] = [
        {
          metadata: {
            name: 'CIF search for 61.147.103.0/24',
            datatype: 'string',
            description: 'CIF search results'
          },
          file: path.join(DATA_PATH, '/data/prisemTestData/testcif4.txt')
        }
      ];

    getUsers(options)
    .then(function (reply) {
      users = reply;
      var numUsers = users.length;
      if (numUsers >= 1) config.push(createOptions(users[0], 'activity', name[0], tg,
        false, '65% confidence indicators'));
      if (numUsers >= 2) config.push(createOptions(users[1], 'activity', name[1], tg,
        false, '95% confidence indicators'));
      if (numUsers >= 3) config.push(createOptions(users[2], 'activity', name[2], tg,
        false, 'Indicator 89.248.172.58'));
      if (numUsers >= 4) config.push(createOptions(users[3], 'activity', name[3], tg,
        false, '95% confidence indicators'));
      if (numUsers >= 1) config.push(createOptions(users[0], 'activity', name[4], tg,
        false, 'Search for records associated with APT1 intrusion set'));
      if (numUsers >= 2) config.push(createOptions(users[1], 'activity', name[5], tg,
        false, 'Search for records associated with suspicious CIDR block'));
      console.log('config array', config);
      _.forEach(config, function (value, index) {
        tickets.push(Ticket.ticketFactory(value));
        console.log('a ticketFactory result', tickets[index]);
        promises.push(tickets[index].create());
      });
      return q.all(promises);
    })
    .then(function (reply) {
      console.log('reply from ticket creation', reply);
      promises = [];
      _.forEach(reply, function (value, index) {
        console.log('in for each reply, value:', value);
        var thisTicket = value;
        var i = _.findIndex(name, function (item) {
          return item === thisTicket.metadata.name;
        });
        console.log('i is ',i);
        _.forEach(topics[i], function (value, index) {
          console.log('now in for each topics, value is ', value);
          console.log('and thisTicket is ', thisTicket);
          console.log('and metadata is ', value.metadata);
          var topic = Topic.topicFactory(thisTicket, value.metadata);
          console.log('topic from topicfactory ', topic);
          console.log('*** Now read the file and create the topic');
          var data = fs.readFileSync(value.file, 'utf8');
          promises.push(topic.create(data));
        });
      });
      return q.all(promises);
    })
    .then(function () {
      return client.quitAsync();
    })
    .then(function () {
      Bookshelf.knex.destroy(function (err, reply) {
        console.log(err, reply);
      });
    })
    .catch(function (err) {
      console.log(err.stack);
      return client.quitAsync()
      .then(function (reply) {
        Bookshelf.knex.destroy(function (err, reply) {
          console.log(err, reply);
        });
      })
    });

  };

  if (!module.parent) {
    bootstrapTickets.runBootstrap(process.argv.slice(2));
  }


})();
