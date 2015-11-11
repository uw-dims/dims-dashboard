'use strict';

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
