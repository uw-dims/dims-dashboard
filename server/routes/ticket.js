// File: server/routes/ticket.js

/** @module routes/ticket */

'use strict';

// Includes
var logger = require('../utils/logger')(module);
var KeyGen = require('../models/keyGen');
var KeyExtract = require('../models/keyExtract');
var resUtils = require('../utils/responseUtils');
var _ = require('lodash-compat');

module.exports = function (ticketService, mitigationService) {

  var ticketRoute = {};

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
      return req.user.get('ident');
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


  ticketRoute.list = function (req, res) {
    logger.debug('routes/ticket GET');
    console.log('ticket route list req.params', req.params);
    console.log('ticket route list req.body', req.body);
    console.log('ticket route list req.query', req.query);
    var user = null,
        config = [],
        errMsg = '';
    if (req.hasOwnProperty(user)) {
      user = req.user.get('ident');
    } else {
      user = 'lparsons';
    }
    console.log('ticketRoute.list, user is', user);

    if (req.query.type === 'mitigation') {
      console.log('go get mitigations');
      mitigationService.listMitigations(user)
      .then(function (reply) {
        res.status(200).send(resUtils.getSuccessReply(reply));
      })
      .catch(function (err) {
        res.status(400).send(resUtils.getErrorReply(err.toString()));
      });
    } else {

      if (_.size(req.query) === 0) {
        config.push({
          type: 'activity',
          private: false
        });
        config.push({
          type: 'activity',
          private: true,
          ownedBy: user
        });
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
          console.log('private is true');
          if (req.query.hasOwnProperty('ownedBy') && user !== req.query.ownedBy) {
            res.status(400).send(resUtils.getErrorReply('Cannot get private tickets from another user'));
          } else if (!req.query.hasOwnProperty('ownedBy')) {
            config.push(_.extend({}, {ownedBy: user, type: 'activity'}, req.query));
          } else {
            config.push(_.extend({}, {type: 'activity'}, req.query));
          }
        } else {
          console.log('private is false');
          config.push(_.extend({}, {type: 'activity'}, req.query));
        }
      }
      console.log('listTickets config is ', config);
      ticketService.listTickets(config)
      .then(function (reply) {
        reply = _.flatten(reply);
        console.log('ticket route list listtickets reply', reply);
        res.status(200).send(resUtils.getSuccessReply(reply));
      })
      .catch(function (err) {
        res.status(400).send(resUtils.getErrorReply(err.toString()));
      });
    }
  };

  ticketRoute.show = function (req, res) {
    logger.debug('routes/ticket SHOW, id: ', req.params.id);
    // var ticket = new Ticket();
    var ticket;
    if (KeyExtract.isMitigation(req.params.id)) {
      mitigationService.getMitigated(req.params.id)
      .then(function (reply) {
        console.log(reply);
        res.status(200).send(resUtils.getSuccessReply(reply));
      })
      .catch(function (err) {
        res.status(400).send(resUtils.getErrorReply(err));
      });
    } else {
      ticketService.getTicket(req.params.id)
      .then(function (reply) {
        console.log(reply);
        res.status(200).send(resUtils.getSuccessReply(reply));
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

  ticketRoute.update = function (req, res) {
    logger.debug('routes/ticket UPDATE');
    console.log (req.body);
    var id = req.params.id;
    if (!req.user) {
      return res.status(500).send('Error: user is not defined in request');
    }
    var user = req.user.get('ident');
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

  // Not implemented
  ticketRoute.delete = function (req, res) {
    logger.debug('routes/ticket DELETE, not implemented');
    res.status(405).send('Ticket delete not yet implemented.');
    // }, function (err,reply) {
    //     res.status(400).send(err.toString());
    //   });
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

