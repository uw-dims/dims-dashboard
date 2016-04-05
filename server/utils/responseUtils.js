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

