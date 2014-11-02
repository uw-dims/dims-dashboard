'use strict';

// Settings routes - retrieve and update settings via REST api for the logged in user

var config = require('../config');
var logger = require('../utils/logger');
var UserSettings = require('../models/userSettings')

exports.get = function(req, res) {

	// id is from logged in user
	var id = req.user.get('ident');
	var client = req.app.get('client');

	var userSettings = new UserSettings(client, id);
	userSettings.getSettings().then(function(data) {
      res.status(200).send({data: data});
    }).then(function(err) {
      return res.status(400).send(err);
    });
};

exports.update = function(req, res) {

	var id = req.user.get('ident');
	var client = req.app.get('client');
	var newSettings = req.body.settings;
	
	UserSettings.getSettings().then(function(data) {
      res.status(200).send({data: data});
    }).then(function(err) {
      return res.status(400).send(err);
    });
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

