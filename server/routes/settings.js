
var config = require('../config');
var logger = require('../utils/logger');
var fs = require('fs');
var dimsutil = require('../utils/util');
var async = require('async');

exports.get = function(req, res) {
	logger.debug('user settings get request, id is ', req.params.id);
	logger.debug('user settings get request. session is ', req.session);
	console.log(req.params.id);
	// Get the redis client
	var client = req.app.get('client');
	var key = 'userSetting:'+req.params.id;
	client.hgetall(key, function(err, data) {
			if (err) {
				return res.status(400).send('Error retrieving from database');
			} else if (data !== null) {
				logger.debug('get result is ', data);
				return res.status(200).send(data);
			} else {
				return res.status(204).send('No settings exist for this user');
			}
	} );

};

exports.create = function(req, res) {
	logger.debug('user settings create request, id {0}, query {1}', req.params.id, req.query);
	console.log(req.query);
	var key = 'userSetting:'+req.query.user;
	var settings = JSON.parse(req.query.settings);
  var client = req.app.get('client');
  client.hmset(key, settings, function(err, data) {
  	if (err) {
				return res.status(400).send('Error setting data in database');
		} else {
			return res.status(200).send(data);;
		}
  });
	
};

exports.update = function(req, res) {
	logger.debug('user settings update request, id {0}, query {1}', req.params.id, req.query);
	console.log(req, query);

	return res.status(200).send(query);
};


// exports.get = function(req, res){
// 	logger.debug('settings get request');
// 	logger.debug('id is ', req.params.id);
// 	var path = config.demoDatastorePath + 'settings.json';
// 	if (req.params.id == 0) {

// 		fs.exists(path, function(exists) {
// 	    if (exists) {
// 	      fs.readFile(path, 'utf8', function(err, data) {
// 	          if (err) {
// 	              logger.error('fs.readFile error', err);
// 	              return res.status(500).send(err);
// 	          } 
// 	          var jsonObject = JSON.parse(data);
// 	          return res.status(200).send(data);
// 	      });
// 	    } else {
// 	        logger.error(path+' does not exist');
// 	        //return res.send(400, 'File does not exist');
// 	        return res.status(400).send('Settings data does not exist');
// 	    }
// 	  });

// 	} else {
// 		logger.error('No settings data for this user id ', req.params.id);
// 		return res.status(400).send('No settings data for this user');
// 	}
// };

// exports.update = function(req, res) {
// 	logger.debug('settings put request');
// 	logger.debug('id is ', req.params.id);
// 	logger.debug('query is ', req.query);
// 	console.log(req.query);

// 	var path = config.demoDatastorePath + 'settings.json';
// 	if (req.params.id == 0) {
// 		var jsonSetting = JSON.stringify(req.query);
// 		logger.debug('json setting is ', jsonSetting);
//     fs.writeFile(path, jsonSetting, 'utf8', function(err, data) {
//         if (err) {
//             console.log('fs.writeFile error', err);
//             return res.status(500).send(err);
//         } 
//         return res.status(200).send(data);
//     });
// 	} else {
// 		return res.status(400).send('No settings data for this user');
// 	}

