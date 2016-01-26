'use strict';

var _ = require('lodash-compat');

// Construct a succesful reply for API call
var getSuccessReply = function getSuccessReply(data) {
  return {
    status: 'success',
    data: data
  };
};

exports.getSuccessReply = getSuccessReply;

// Construct an error reply for API call
var getErrorReply = function getErrorReply(err) {
  return {
    status: 'error',
    message: err.toString()
  };
};

exports.getErrorReply = getErrorReply;

// Construct a failure reply for API call
var getFailReply = function getFailReply(errorObj) {
  return {
    status: 'fail',
    data: errorObj
  };
};

exports.getFailReply = getFailReply;

// Regex
var validRegex = function validRegex() {
  return /^[a-z0-9 _-]+$/i;
};

exports.validRegex = validRegex;

// Parse validation error array to string
var getValidateError = function getValidateError(errors) {
  var response = '';
  _.forEach(errors, function (value, key) {
    response += 'Validation error: ' + value.msg + ', value supplied: ' + value.value + ' ';
  });
  return response;
};

exports.getValidateError = getValidateError;

// Used to insert path in API replies
var formatResponse = function formatResponse(key, data) {
  var result = {};
  result[key] = data;
  return result;
};

exports.formatResponse = formatResponse;

