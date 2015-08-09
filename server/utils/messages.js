'use strict';

//var flash = require('connect-flash');

module.exports = function () {
  return function (req, res, next) {
    var errorMessages = req.flash('error');
    var infoMessages = req.flash('info');
    var successMessages = req.flash('success');
    res.locals.messages = [];
    for (var i in errorMessages) {
      res.locals.messages.push({type: 'error', message: errorMessages[i]});
    }
    for (i in infoMessages) {
      res.locals.messages.push({type: 'info', message: infoMessages[i]});
    }
    for (i in successMessages) {
      res.locals.messages.push({type: 'success', message: successMessages[i]});
    }
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
  };
};
