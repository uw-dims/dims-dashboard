'use strict';

var _ = require('lodash-compat');

var getSuccessReply = function getSuccessReply(data) {
  return {
    status: 'success',
    data: data
  };
};

exports.getSuccessReply = getSuccessReply;

var getErrorReply = function getErrorReply(err) {
  return {
    status: 'error',
    message: err.toString()
  };
};

exports.getErrorReply = getErrorReply;

var getFailReply = function getFailReply(errorObj) {
  return {
    status: 'fail',
    data: errorObj
  };
};

exports.getFailReply = getFailReply;

var validRegex = function validRegex() {
  return /^[a-z0-9 _-]+$/i;
};

exports.validRegex = validRegex;

var getValidateError = function getValidateError(errors) {
  var response = '';
  _.forEach(errors, function (value, key) {
    response += 'Validation error: ' + value.msg + ', value supplied: ' + value.value + ' ';
  });
  return response;
};

exports.getValidateError = getValidateError;

