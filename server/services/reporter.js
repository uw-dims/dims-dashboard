#!/usr/bin/env node
'use strict';

var csvtojson = require('csvtojson');
var request = require('request');
var _ = require('lodash-compat');
var fs = require('fs');
var moment = require('moment');
var path = require('path');

(function () {
  var reporter = {};
  var Converter = csvtojson.Converter;

  exports.createReport = reporter.createReport = function (user, pass, allCsvPath, summaryCsvPath, cycle) {

    var summaryJson = {};
    var allJson = {};
    var testResults;
    var restOptions = {
      host: 'http://jira.prisem.washington.edu',
      // path: '/rest/api/2/search?jql=issueType=Test%20AND%20created%3E%3D-' + days + 'd'
      path: '/rest/api/2/search?jql=issueType=Test'
    };
    var summaryPath = process.env.GIT + '/dims-tr/test_cycles/' + cycle;
    var metadataPath = summaryPath + '/jira_data';
    var generatedTime = moment().toISOString();

    // Map custom field names to known names:
    var testLevel = 'customfield_10400';
    var testClass = 'customfield_10401';
    var qualificationMethod = 'customfield_10402';
    var dimssrReference = 'customfield_10404';
    var typeOfData = 'customfield_10405';

    //TODO(lparsons) : read field configurations and allowed values from external source when available
    var fields = {
      id: 'id',
      testClass: 'testClass',
      testLevel: 'testLevel',
      qualificationMethod: 'qualificationMethod',
      dimssrReference: 'dimssrReference',
      results: 'results',
      status: 'status'
    };

    console.log('[+++] Processing data for cycle ' + cycle + ' at ' + generatedTime);
    console.log('[+++] File containing summary CSV at ' + summaryCsvPath);
    console.log('[+++] File containing all CSV data at ' + allCsvPath);
    console.log('[+++] Will write generated summary to' + summaryPath);
    console.log('[+++] Will write metdata and results to' + metadataPath);

    // Setup the csv converters
    var allConverter = new Converter({});
    var summaryConverter = new Converter({});
    allConverter.on('end_parsed', function (jsonArray) {
      console.log('[+++] allConverter completed. We have all Json results');
      // console.log(jsonArray);
      allJson = jsonArray;
      fs.createReadStream(summaryCsvPath).pipe(summaryConverter);
    });
    summaryConverter.on('end_parsed', function (jsonArray) {
      console.log('[+++] summaryConverter completed. We have summary results');
      // console.log(jsonArray);
      summaryJson = jsonArray;
      console.log('[+++] Processing test results');
      testResults = processCsvJson(allJson, summaryJson);
      console.log('[+++] Writing test_cycle_summary.json file to disk');
      fs.writeFileSync(summaryPath + '/jira_data_summary.json', JSON.stringify(testResults), 'utf8');
      console.log('[+++] Display test cycle summary data');
      console.log(testResults);
      console.log('[+++] Now do http request to get test metadata and write files');
      getRequest();
    });

    fs.createReadStream(allCsvPath).pipe(allConverter);

    var validateResult = function validateResult(key, file) {
      var fileArray = file.split('.');
      if (fileArray[0] !== key) {
        return false;
      }
      return true;
    };

    var getResultField = function getResultField(key, status, input) {
      console.log('[+++] getResultfield. key %s, status %s, input %s', key, status, input);
      if (status === 'TODO') {
        return '';
      }
      if (input === null) {
        return '';
      }
      if (input === 'N/A') {
        return input;
      }
      if (validateResult(key, input)) {
        try {
          var stats = fs.statSync(path.join(metadataPath, input));
          if (stats.isFile()) {
            return input;
          }
        } catch (err) {
          console.warn('[!!!] Result File %s does not exist!', input, err);
          return '';
        }
      } else {
        console.error('Key %s does not match file name base of %', key, input);
        return '';
      }
    };

    var getStatus = function getStatus(status) {
      if (status === 'PASS' || status === 'FAIL') {
        return status;
      }
      return 'TODO';
    };

    var validateIssue = function validateIssue(fields) {
      if (fields[testLevel] === null ||
           fields[testClass] === null ||
           fields[qualificationMethod] === null ||
           fields[dimssrReference] === null) {
        return false;
      }
      // will make this more robust
      return true;
    };

    // initialJson has more tickets in it than are in the test cycle,
    // so we will use testResults to determine if an issue is in the current cycle
    var writeMetadataFiles = function writeMetadataFiles(initialJson) {
      var result = [];
      var issues = initialJson.issues;
      // console.log(issues);
      _.forEach(issues, function (value, index) {
        // Find a matching test in the cycle that has been run
        var filterresult = _.filter(testResults.tests, 'ID', value.key);
        if (filterresult.length === 1) {
          var issueStatus = _.pluck(filterresult, 'Status'); 
          var config = {};
          console.log('[+++] Found a test in the cycle. Summary is ', value.fields.summary);
          var status = getStatus(issueStatus[0]);
          if (validateIssue(value.fields)) {
            config[fields.id] = value.key;
            config[fields.testLevel] = value.fields[testLevel][0].value;
            config[fields.testClass] = value.fields[testClass][0].value;
            config[fields.qualificationMethod] = value.fields[qualificationMethod][0].value;
            config[fields.dimssrReference] = value.fields[dimssrReference];
            config[fields.results] = getResultField(value.key, status, value.fields[typeOfData]);
            config[fields.status] = status;
            result.push(config);
            var metaFilePath = path.join(metadataPath, value.key + '.json');
            var fileContents = JSON.stringify(config);
            fs.writeFileSync(metaFilePath, fileContents, 'utf8');
          }
        }
      });
      console.log(result);
      return result;
    };

    var processCsvJson = function processCsvJson(all, summary) {
      var result = {
        time: generatedTime,
        cycle: cycle,
        tests: []
      };
      _.forEach(summary, function (value, index) {
        var config = {};
        // console.log('[+++] going through summary. ID is ', value.ID);
        config.ID = value.ID;
        config.Status = value.Status;
        config.Summary = value.Summary;
        config.ExecutedBy = value['Executed By'];
        config.ExecutedOn = value['Executed On'];
        config.Comment = value.Comment;
        config.TestSteps = [];
        _.forEach(all, function (value, index) {
          // console.log('[+++] checking all results issue %s ID %s ', value['Issue Key'], config.ID);
          if (value['Issue Key'] === config.ID) {
            var subConfig = {};
            subConfig.ExecutedBy = value['Executed By'];
            subConfig.ExecutedOn = value['Executed On'];
            subConfig.StepResult = value['Step Result'];
            subConfig.OrderId = value.OrderId;
            subConfig.Step = value.Step;
            subConfig.TestData = value['Test Data'];
            subConfig.ExpectedResult = value['Expected Result'];
            config.TestSteps.push(subConfig);
          }
        });
        result.tests.push(config);
      });
      return result;
    };

    var getRequest = function getRequest() {
      request.get(restOptions.host + restOptions.path, {
        'auth': {
          'user': user,
          'pass': pass
        },
        json: true
      }, function (error, response, body) {
        if (error) {
          console.log(error);
        } else {
          var result = writeMetadataFiles(body);
          // console.log(result);
        }
      });
    };
  };

  if (!module.parent) {
    reporter.createReport(process.argv[2], process.argv[3], process.argv[4],
      process.argv[5], process.argv[6]);
  }
})();
