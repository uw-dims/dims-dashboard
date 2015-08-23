// File: server/routes/ticket.js

/** @module routes/ticket */

'use strict';

// Includes
var logger = require('../utils/logger')(module);
var KeyGen = require('../models/keyGen');
var KeyExtract = require('../models/keyExtract');

module.exports = function (Ticket) {

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

  var packageTicket = function (ticket, topics) {
    var data = {};
    data.ticket = ticket.getTicketMetadata();
    data.key = KeyGen.ticketKey(ticket);
    data.topics = topics;
    logger.debug('services/ticket._packageBaseTicket data is now ', data);
    return data;
  };

  /**
    * @description Returns list of all ticket keys
    *
    * Invoked via GET https://dashboard_url/api/ticket/
    * @method: list
    * @example
    * Sample response:
    *
    *   { "data": [
    *       "ticket:1",
    *       "ticket:2",
    *       "ticket:3" ]
    *   }
    *
    * @example
    *
    *  Using curl:
    *
    *     curl -k https://dashboard_url/api/ticket/
    *
    * @return HTTP Status code and string reply.
    */
  ticketRoute.list = function (req, res) {
    logger.debug('routes/ticket GET');
    // var ticket = Ticket.ticketFactory();
    Ticket.getAllTicketKeys().then(function (reply) {
      res.status(200).send({data: reply});
    }, function (err) {
      res.status(400).send(err.toString());
    });
  };

  /**
    * Returns a ticket: ticket key, ticket metadata, list of associated topic keys
    * @return HTTP Status code and string reply.
    *
    * @example
    * Example response:
        {"data": {
          "ticket":
            {"num":"1",
            "creator":"testuser",
            "type":"data",
            "createdTime":"1418060768120",
            "open":"true"},
          "key":"ticket:1",
          "topics":["ticket:1:data:cif:results:result1.txt",
                    "ticket:1:data:cif:results:result2.txt"]
          }
        }
    * @example How to invoke
    *   GET https://dashboard_url/api/ticket/ticket:1
    *
    *   Using curl:
    *     curl -k https://dashboard_url/api/ticket/ticket:1
    *
    * @param {string} id Ticket key in format ticket:<num>
    */
  ticketRoute.show = function (req, res) {
    logger.debug('routes/ticket SHOW, id: ', req.params.id);
    // var ticket = new Ticket();
    var ticket;
    // Get the ticket object and stored metadata. returns ticket object.
    Ticket.getTicket(req.params.id).then(function (reply) {
      // logger.debug('SHOW getTicket reply', reply);
      ticket = reply; // update the ticket
      // Get array of associated topic keys
      return ticket.getTopicKeys();
    }).then(function (reply) {
        // Send back ticket key, metadata, array of associated topic keys
        res.status(200).send({data: packageTicket(ticket, reply)});
      }, function (err, reply) {
        /* jshint unused: false */
        res.status(400).send(err.toString());
      });
  };

  /**
    * Creates a new ticket
    * @method create
    * @return HTTP Status code and string reply.
        {"data": {
          "ticket":
            {"num":"2",
            "creator":"testuser",
            "type":"data",
            "createdTime":"1418060768120",
            "open":"true"},
          "key":"ticket:2"
          }
        }
    * @example
    *
    *   POST https://dashboard_url/api/ticket/
    *     body:
    *     {
    *       "type": "data",
    *       "creator": "testuser"
    *     }
    *
    *    Using curl:
    *      curl --data "type=data&creator=testuser" -k https://dashboard_url/api/ticket
    *
    * @param {string} type Type of ticket being created
    * @param {string} creator Username of user creating ticket (optional if user logged in,
    *                ignored if user logged in)
    */
  ticketRoute.create = function (req, res) {
    logger.debug('routes/ticket CREATE');
    // Check for missing inputs
    var creator = getCreator(req);
    if (creator === -1) {
      res.status(400).send('Error: Creator not supplied.');
    }
    var type = getType(req);
    if (type === -1) {
      res.status(400).send('Error: Type not supplied.');
    } else {
      logger.debug('routes/ticket content param ', req.body.content);
      var content = (req.body.content !== null && typeof req.body.content === undefined) ? req.body.content : null;
      // Create the ticket and get the data to return
      ticketService.createTicket(type, creator, content).then(function (reply) {
        logger.debug('routes/ticket reply from ticketService.createTicket ', reply);
        res.status(201).send({data: reply});
      }, function (err, reply) {
          res.status(400).send(err.toString());
        });
      logger.debug('routes/ticket Got to here 1');
    }
  };

  // Not implemented
  ticketRoute.update = function (req, res) {
    logger.debug('routes/ticket UPDATE, not implemented ');
    res.status(405).send('Ticket update not yet implemented.');
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

  /**
    * Adds a topic (metadata) to a ticket and saves the data (content)
    * @method addTopic
    * @return HTTP Status code and string reply.
    * @example
    * Sample json response:
    *
    *   {"data":{
    *      "topic":{
    *        "parent":{
    *           "num":"12","creator":"testUser","type":"analysis","createdTime":"1418131797522","open":"true"
    *         },
    *         "type":"analysis",
    *         "name":"namesearch:result2",
    *         "dataType":"hash"
    *         },
    *        "content":{"firstname":"bob","lastname":"johnson"},
    *        "key":"ticket:12:analysis:namesearch:result2"
    *       }
    *    }
    *
    * @example
    * Example URI
    *     POST https://dashboard_url/api/ticket/ticket:27/topic
    *     body:
    *     {
    *       "name": "cif:results:1418060768120",
    *       "dataType": "string",
    *       "content": <string content>
    *     }
    * Note that content in this example could be JSON that is stringified. Content could also be content of a
    * file, base64'd, as in
    *     POST https://dashboard_URL/api/ticket/ticket:28/topic
    *     body:
    *     {
    *       "name": "mal4s:result:resul1.png",
    *       "dataType": "string",
    *       "content": <base64 content of a .png file>
    *     }
    *
    * Using curl with hash content (content is uri encoded):
    *      curl --data "name=namesearch:results&dataType=hash&content=%7B%22firstname%22:%22bob%22,%22lastname%22:%22johnson%22%7D" -k https://dashboard_url/api/ticket/ticket:12/topic
    *
    * A successful response from the curl command might look like the following (line feeds added for clarity - reponse is just a string):
    *      {"data":{
    *       "topic":{
    *         "parent":{"num":"12","creator":"testUser","type":"analysis","createdTime":"1418131797522","open":"true"},
    *         "type":"analysis","name":"namesearch:result2","dataType":"hash"},
    *         "content":{"firstname":"bob","lastname":"johnson"},"key":"ticket:12:analysis:namesearch:result2"}}
    *
    * @param {string} id Ticket key in format ticket:<num>
    * @param {string} name Name of the topic - this represents the last part of the topic key after
    *                      ticket:<num>:<ticket_type>:
    * @param {string} dataType Redis data structure to store the contents in - can be string or hash
    * @param {string} content  Content to be stored
    *
    * Note that content is optional if type is string. If no content is specified, then an empty string
    * is stored at the topic key. You would use this if you want to use the contents of a file as the
    * data to be stored. First create the topic with a type of string and no content. Then you use the
    * returned topic key and do an update (PUT) of the topic with the uploaded file.
    *
    * You cannot overwrite an existing topic with the same key. An error is returned if the topic already
    * exists
    */
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


  /**
    * Retrieves a ticket topic's metadata and content. Invoked via GET
    *
    * <pre>Sample response:
    *
    *    { "data":{
    *      "topic":{
    *         "parent":{
    *           "num":"12","creator":"testUser","type":"analysis","createdTime":"1418131797522","open":"true"
    *          },
    *         "type":"analysis",
    *         "name":"namesearch:result2",
    *         "dataType":"hash"
    *        },
    *        "content":{"firstname":"bob","lastname":"johnson"},
    *        "key":"ticket:12:analysis:namesearch:result2"
    *       }
    *     }</pre>
    *
    * @method showTopic
    *
    * @example
    *
    *     GET https://dashboard_url/api/ticket/topic/ticket:27:analysis:namesearch:result2
    *
    *    Using curl:
    *
    *      curl -k https://dashboard_url/api/ticket/topic/ticket:27:analysis:namesearch:result2
    *
    * @param {string} id Ticket topic key in format ticket:<num>:<type>:<topic_name>
    * @return HTTP Status code and string reply.
    */
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

  /**
    * Updates a ticket topic. You can only update content.
    * @method updateTopic
    * @return HTTP Status code and string reply.
    *   {"data":{
    *      "topic":{
    *        "parent":{
    *           "num":"12","creator":"testUser","type":"analysis","createdTime":"1418131797522","open":"true"
    *         },
    *         "type":"analysis",
    *         "name":"namesearch:result2",
    *         "dataType":"hash"
    *         },
    *        "content":{"firstname":"john","lastname":"johnson"},
    *        "key":"ticket:12:analysis:namesearch:result2"
    *       }
    *    }
    * @example
    *
    *     PUT https://dashboard_url/api/ticket/ticket:27/topic
    *     body:
    *     {
    *       "content": <string content>
    *     }
    *   Note that content in this example could be JSON that is stringified. Content could also be content of a
    *   file, base64'd, as in
    *     PUT https://dashboard_URL/api/ticket/ticket:28/topic
    *     body:
    *     {
    *       "content": <base64 content of a .png file>
    *     }
    *
    *    Using curl with hash content (content is uri encoded):
    *      curl --data "content=%7B%22firstname%22:%22john%22,%22lastname%22:%22johnson%22%7D" -k https://dashboard_url/api/ticket/ticket:12/topic
    *
    *    A successful response from the curl command might look like the following (line feeds added for clarity - reponse is just a string):
    *      {"data":{
    *       "topic":{
    *         "parent":{"num":"12","creator":"testUser","type":"analysis","createdTime":"1418131797522","open":"true"},
    *         "type":"analysis","name":"namesearch:result2","dataType":"hash"},
    *         "content":{"firstname":"john","lastname":"johnson"},"key":"ticket:12:analysis:namesearch:result2"}}
    *
    * @param {string} id Topic key in format ticket:<num>:<type>:<topic_name>
    * @param {string} content  Content to be stored
    *
    */
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

