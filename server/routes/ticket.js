'use strict';

// Includes
var logger = require('../utils/logger')(module);
var KeyGen = require('../models/keyGen');
var KeyExtract = require('../models/keyExtract');
var resUtils = require('../utils/responseUtils');
var _ = require('lodash-compat');

module.exports = function (ticketService, mitigationService, access) {

  var ticketRoute = {};

  var validateTrustgroup = function validateTrustgroup(req, userAccess) {
    var validated = false;
    // Does user have access to this trust group?
    if (req.query.hasOwnProperty('tg')) {
      if (access.isAuthorized(userAccess, req.query.tg)) {
        validated = true;
      }
    // If trust group not supplied, is user a superuser?
    } else {
      if (access.isSysAdmin(userAccess)) {
        validated = true;
      }
    }
    return validated;
  };

  var getDefaultConfig = function getDefaultConfig(userAccess) {
    console.log('ticket route getDefaultConfig, userAccess is ', userAccess);
    var config = [];
    var user = access.username(userAccess);
    _.forEach(userAccess.tgs, function (value, key) {
      logger.debug('getDefaultConfig value ', value, 'key', key);
      config.push({
        // type: 'activity',
        private: false,
        tg: key
      });
      config.push({
        // type: 'activity',
        private: true,
        ownedBy: user,
        tg: key
      });
    });
    return config;
  };

  ticketRoute.list = function (req, res) {

    console.log('in ticketroute list. query is ', req.query);
    var userAccess,
        user,
        config = [];

    // user is the authorizations object contained in the request. It must be present
    if (!req.user) {
      return res.status(500).send(resUtils.getErrorReply('Authentication error: User is not defined in request'));
    }

    // Get the access object
    userAccess = req.user;
    // Get the user from the access object
    user = access.username(userAccess);
    // logger.debug('LIST userAccess', userAccess);
    // Validate trust group

    if (!validateTrustgroup(req, userAccess)) {
      return res.status(400).send(resUtils.getErrorReply('Requesting tickets in trustgroup that user is not authorized for'));
    }

    // If type is mitigation, use mitigation service
    // Mitigations are always public but may be open or closed and will be in a trust group
    if (req.query.type === 'mitigation') {
      var query = {};
      if (req.query.hasOwnProperty('open')) {
        if (req.query.open === 'true') {
          query.open = true;
        } else if (req.query.open === 'false') {
          query.open = false;
        } else {
          return res.status(400).send(resUtils.getFailReply({open: 'Must be boolean'}));
        }
      }
      if (req.query.hasOwnProperty('tg')) {
        query.tg = req.query.tg;
      }
      mitigationService.listMitigations(user, query)
      .then(function (reply) {
        // console.log('reply from listMitigations', reply);
        return res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse('mitigations', reply)));
      })
      .catch(function (err) {
        return res.status(400).send(resUtils.getErrorReply(err.toString()));
      });

    // not a mitigation ticket
    } else {
      // no params supplied. Will return all activity tickets that are public
      // and all private tickets for the user,
      // for all trustgroups the user is authorized for
      if (_.size(req.query) === 0) {
        config = getDefaultConfig(userAccess);
      // params supplied, so let's validate them
      } else {

        var options = {};
        if (!req.query.hasOwnProperty('private')) {
          config.push(_.extend({}, {
            private: true,
            ownedBy: user,
            type: 'activity'
          }, req.query));
          config.push(_.extend({}, {
            private: false,
            type: 'activity'
          }, req.query));

        } else if (req.query.private === 'true') {
          if (req.query.hasOwnProperty('ownedBy') && user !== req.query.ownedBy) {
            res.status(400).send(resUtils.getErrorReply('Cannot get private tickets from another user'));
          } else if (!req.query.hasOwnProperty('ownedBy')) {
            config.push(_.extend({}, {ownedBy: user, type: 'activity'}, req.query));
          } else {
            config.push(_.extend({}, {type: 'activity'}, req.query));
          }
        } else {
          config.push(_.extend({}, {type: 'activity'}, req.query));
        }
      }
      console.log('listTickets config is ', config);
      ticketService.listTickets(config)
      .then(function (reply) {
        reply = _.flatten(reply);
        res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse('tickets', reply)));
      })
      .catch(function (err) {
        res.status(400).send(resUtils.getErrorReply(err.toString()));
      });
    }
  };

  ticketRoute.show = function (req, res) {
    var userAccess,
        user,
        trustgroup =  null;

    // user is the authorizations object contained in the request
    if (!req.user) {
      return res.status(500).send(resUtils.getErrorReply('Authentication error: User is not defined in request'));
    }
    // Get the access object
    userAccess = req.user;
    // Get the user from the access object
    user = access.username(userAccess);
    // logger.debug('SHOW userAccess', userAccess);
    logger.debug('SHOW, id: ', req.params.id);
    logger.debug('SHOW query', req.query);

    // ok so this currently circumvents some privacy!!
    // TODO: fix it - will need to know trust group user is

    // check for mitigation ticket request
    if (KeyExtract.isMitigation(req.params.id)) {
      mitigationService.getMitigation(req.params.id, user)
      .then(function (reply) {
        res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse('mitigation', reply)));
      })
      .catch(function (err) {
        res.status(400).send(resUtils.getErrorReply(err));
      });

    // logged into
    } else {
      ticketService.getTicket(req.params.id)
      .then(function (reply) {
        if (reply.metadata.private && user !== reply.metadata.creator) {
          res.status(400).send(resUtils.getErrorReply('You do not have permission to view this ticket'));
        } else {
          res.status(200).send(resUtils.getSuccessReply(resUtils.formatResponse('tickets', reply)));
        }
      })
      .catch(function (err) {
        res.status(400).send(resUtils.getErrorReply(err.toString()));
      });
    }
  };

  ticketRoute.create = function (req, res) {
    logger.debug('routes/ticket CREATE');
    // Check for missing inputs
    var creator = getCreator(req);
    if (creator === -1) {
      res.status(400).send(resUtils.getErrorReply('Error: Creator not supplied.'));
    }
    var type = getType(req);
    if (type === -1) {
      res.status(400).send(resUtils.getErrorReply('Error: Type not supplied.'));
    }
    var name = getName(req);
    if (name === -1) {
      res.status(400).send(resUtils.getErrorReply('Error: Name not supplied.'));
    }
    var privateTicket = getPrivate(req);
    if (privateTicket === -1) {
      res.status(400).send(resUtils.getErrorReply('Error: Invalid privacy supplied.'));
    }
    var content = (req.body.content !== null && typeof req.body.content === undefined) ? req.body.content : null;
    var ticket = Ticket.ticketFactory({
      creator: creator,
      description: getDescription(req),
      type: type,
      private: privateTicket
    });
    if (type === 'mitigation') {
      mitigationService.create(ticket, content)
      .then(function (reply) {
        res.status(201).send({data: packageTicket(reply)});
      })
      .catch(function (err) {
        res.status(500).send(err.toString());
      });
    } else {
      ticket.create()
      .then(function (reply) {
        res.status(201).send({data: packageTicket(ticket)});
      })
      .catch(function (err) {
        res.status(500).send(err.toString());
      });
    }
  };

  // Implemented for Mitigation ticket only
  ticketRoute.update = function (req, res) {
    logger.debug('routes/ticket UPDATE');
    console.log (req.body);
    var id = req.params.id;
    if (!req.user) {
      return res.status(500).send('Error: user is not defined in request');
    }
    var user = req.user.username;
    var options = req.body;
    if (options.hasOwnProperty('type') && options.hasOwnProperty('action')) {
      if (options.type === 'mitigation' && options.action === 'remediate') {
        mitigationService.remediate(id, user, options.ips)
        .then(function (reply) {
          console.log(reply);
          res.status(200).send(resUtils.getSuccessReply(reply));
        })
        .catch(function (err) {
          res.status(400).send(resUtils.getErrorReply(err.toString()));
        });
      } else {
        res.status(405).send('Ticket update not yet implemented.');
      }
    } else {
      res.status(405).send('Ticket update not yet implemented.');
    }
    // }, function (err,reply) {
    //     res.status(400).send(err.toString());
    //   });
  };

  ticketRoute.delete = function (req, res) {
    logger.debug('routes/ticket DELETE');
    // user is the authorizations object contained in the request. It must be present
    if (!req.user) {
      return res.status(500).send(resUtils.getErrorReply('Authentication error: User is not defined in request'));
    }

    // Get the access object
    userAccess = req.user;
    // Get the user from the access object
    user = access.username(userAccess);
    logger.debug('LIST userAccess', userAccess);
  };

  /**
    * Determines the creator based upon creator supplied in post request
    * and logged in user
    * @function getCreator
    * @private
    * @return creator string or -1 if creator invalid
    */
  var getCreator = function (req) {
    if (!req.user) {
      if (!req.body.creator) {
        return -1;
      }
      var creator = req.body.creator.trim();
      if (creator === '') {
        return -1;
      }
      return creator;
    } else {
      return req.user.username;
    }
  };

  var getType = function (req) {
    if (!req.body.type) {
      return -1;
    }
    var type = req.body.type.trim();
    if (type === '') {
      return -1;
    }
    return type;
  };

  var getName = function (req) {
    if (!req.body.name) {
      return -1;
    }
    var name = req.body.name.trim();
    if (name === '') {
      return -1;
    }
    return name;
  };

  var getDescription = function (req) {
    if (!req.body.description) {
      return '';
    } else {
      return req.body.description;
    }
  };

  var getPrivate = function (req) {
    if (!req.body.private) {
      return false;
    } else {
      if (typeof req.body.private !== 'boolean') {
        return -1;
      } else {
        return req.body.private;
      }
    }
  };

  var packageTicket = function (ticket, topics) {
    var data = {};
    data.ticket = ticket.metdata;
    data.key = ticket.key;
    if (topics) {
      data.topics = topics;
    }
    logger.debug('services/ticket._packageBaseTicket data is now ', data);
    return data;
  };


  ticketRoute.addTopic = function (req, res) {
    logger.debug('routes/ticket addTopic, id: ', req.params.id);
    var data = {},
        ticket;
    var ticketKey = req.params.id;
    var name = req.body.name;
    var dataType = req.body.dataType;
    var content = req.body.content || '';
    // need to add some error checking here
    if (dataType === 'hash') {
      content = JSON.parse(content);
    }
    logger.debug('routes/ticket.addTopic. Content after possible parse is ', content);
    Ticket.getTicket(ticketKey).then(function (reply) {
      // This populates the ticket object with metadata stored at the key
      // Add topic will return an error if the topic already exists
      ticket = reply;
      return ticket.addTopic(name, dataType, content);
    }).then(function (reply) {
      data.topic = reply;
      data.content = content;
      data.key = KeyGen.topicKey(reply);
      res.status(200).send({data: data});
    }, function (err, reply) {
        logger.debug('routes/ticket.addTopic. Err is ', err, ', Reply is ', reply);
        // Need to determine the actual errors that can occur. This response status is for
        // the resource already exists
        res.status(422).send(err.toString());
      });
  };

  ticketRoute.showTopic = function (req, res) {
    logger.debug('routes/ticket showTopic, id: ', req.params.id);
    // var ticket = new Ticket();
    var ticket,
        topic;
    var topicKey = req.params.id;
    var ticketKey = KeyExtract.ticketKey(topicKey);
    logger.debug('showTopic. ticketKey, topickey', ticketKey, topicKey);
    Ticket.getTicket(ticketKey).then(function (reply) {
      logger.debug('showTopic, got ticket');
      ticket = reply;
      return ticket.topicFromKey(topicKey);
    }).then(function (reply) {
      // Reply is a topic object
      // logger.debug('showtopic topic object is ', reply);
      topic = reply;
      logger.debug('topic key is now ', KeyGen.topicKey(topic));
      // Get the content
      return topic.getContents();
    }).then(function (reply) {
      // Reply is the contents object
      var data = {};
      data.topic = topic;
      data.content = reply;
      data.key = req.params.id;
      // console.log(data);
      res.status(200).send({data: data});
    }, function (err, reply) {
        res.status(400).send(err.toString());
      });
  };


  ticketRoute.updateTopic = function (req, res) {
    logger.debug('routes/ticket updateTopic, id: ', req.params.id);
    // var ticket = new Ticket();
    var ticket,
        topic;
    var topicKey = req.params.id;
    var content = req.body.content;

    var parsedKey = KeyGen.parseTopicKey(req.params.id);
    var ticketKey = parsedKey.ticketKey;
    Ticket.getTicket(ticketKey).then(function (reply) {
      ticket = reply;
      return ticket.topicFromKey(topicKey);
    }).then(function (reply) {
      // Reply is a topic object
      topic = reply;
      if (topic.dataType === 'hash') {
        content = JSON.parse(content);
      }
      logger.debug('routes/ticket.updateTopic. Content after possible parse is ', content);
      // Get the content
      return topic.setData(content);
    }).then(function (reply) {
      logger.debug('routes/ticket.updateTopic. Reply from setData is ', reply);
      // Reply is the contents object
      var data = {};
      data.topic = topic;
      data.content = content;
      data.key = req.params.id;
      // console.log(data);
      res.status(200).send({data: data});
    }, function (err, reply) {
        res.status(400).send(err.toString());
      });
  };

  ticketRoute.deleteTopic = function (req, res) {
    logger.debug('routes/ticket deleteTopic, not yet implemented');
    var data = {};
    res.status(405).send('Ticket deleteTopic not yet implemented.');
  };

  return ticketRoute;
};

