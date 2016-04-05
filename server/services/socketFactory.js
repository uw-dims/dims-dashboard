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

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(SocketFactory, EventEmitter);
var logger = require('../utils/logger')(module);

// Controlling module for setting up sockets
module.exports = SocketFactory;

function SocketFactory(io, path, rcvEvent, pubEvent) {
  var self = this;
  self.path = path;
  self.rcvEvent = rcvEvent;
  self.pubEvent = pubEvent;
  EventEmitter.call(self);
  self.socket = self.createSocket(io);
}

// Handler for received messages that need to be published to fanout
SocketFactory.prototype.onMessage = function (msg) {
  var self = this;
  self.emit(self.pubEvent, msg.message);
};

// Returns a socket.io socket
SocketFactory.prototype.createSocket = function (io) {
  var self = this;
  // Path defines the socket address
  logger.debug('Creating new socket. path %s', self.path);
  var newSocket = io
    .of(self.path)
    .on('connection', function (socket) {
      self.connectionID = socket.conn.id;
      self.serverAddr = socket.conn.remoteAddress;
      self.clientIP = socket.conn.request.headers['x-real-ip'];
      logger.debug('Socket client connection: ID %s, path %s, IP %s', self.connectionID, self.path, self.clientIP);
      // Listener for receive event - needed if msg is supposed to be published
      if (self.pubEvent !== null) {
        // logger.debug('Set listener for io event %s', self.rcvEvent);
        socket.on(self.rcvEvent, self.onMessage.bind(self));
      }
      socket.on('disconnect', function (evt) {
        /* jshint unused: false */
        logger.debug('Socket disconnect from client: ID %s, path %s', socket.conn.id, self.path);
      });
      socket.on('error', function (err) {
        logger.error('Socket error: ConnectionID %s, path %s', socket.conn.id, self.path, err);
      });
    });
  return newSocket;
};

