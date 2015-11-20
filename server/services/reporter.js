#!/usr/bin/env node
'use strict';

var csvtojson = require('csvtojson');
var request = require('request');
var _ = require('lodash-compat');
var fs = require('fs');
var moment = require('moment');

(function () {
  var reporter = {};
  var Converter = csvtojson.Converter;

  exports.createReport = reporter.createReport = function (user, pass, days, allCsvPath, summaryCsvPath, cycle) {

    var summaryJson = {};
    var allJson = {};
    var testResults;
    var restOptions = {
      host: 'http://jira.prisem.washington.edu',
      path: '/rest/api/2/search?jql=issueType=Test%20AND%20created%3E%3D-' + days + 'd'
    };
    var targetFilePath = process.env.GIT + '/dims-tr/docs/jira_data/' + cycle;
    var generatedTime = moment().toISOString();
    // Map custom field names to known names:
    var testLevel = 'customfield_10400';
    var testClass = 'customfield_10401';
    var qualificationMethod = 'customfield_10402';
    var dimssrReference = 'customfield_10404';
    var typeOfData = 'customfield_10405';

    console.log('[+++] Processing data for cycle ' + cycle + ' at ' + generatedTime);
    console.log('[+++] File containing summary CSV at ' + summaryCsvPath);
    console.log('[+++] File containing all CSV data at ' + allCsvPath);
    console.log('[+++] Will write generated files to' + targetFilePath);

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
      fs.writeFileSync(targetFilePath + '/test_cycle_summary.json', JSON.stringify(testResults), 'utf8');
      console.log('[+++] Display test cycle summary data');
      console.log(testResults);
      console.log('[+++] Now do http request to get test metadata and write files');
      getRequest();
    });

    fs.createReadStream(allCsvPath).pipe(allConverter);

    var writeMetadataFiles = function writeMetadataFiles(initialJson) {
      var result = [];
      var issues = initialJson.issues;
      // console.log(issues);
      _.forEach(issues, function (value, index) {
        // Find a matching test in the cycle that has been run
        var status = _.pluck(_.filter(testResults.tests, 'ID', value.key), 'Status');
        console.log('[+++] Iterating over tests. index is ' + index, ' status is ' + status, ' key is ' + value.key);
        if (status[0] === 'FAIL' || status[0] === 'PASS') {
          var config = {};
          console.log('[+++] Found a completed test. Summary is ', value.fields.summary);
          config['01_testLevel'] = value.fields[testLevel][0].value;
          config['02_testClass'] = value.fields[testClass][0].value;
          config['03_qualificationMethod'] = value.fields[qualificationMethod][0].value;
          config['04_dimssrReference'] = value.fields[dimssrReference];
          config['05_typeOfData'] = {
            'result_file': value.fields[typeOfData]
          };
          result.push(config);
          fs.writeFileSync(targetFilePath + '/' + value.key + '.json', JSON.stringify(config), 'utf8');
        }
      });
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
        config.ID = value.ID;
        config.Status = value.Status;
        config.Summary = value.Summary;
        config.ExecutedBy = value['Executed By'];
        config.ExecutedOn = value['Executed On'];
        config.Comment = value.Comment;
        config.TestSteps = [];
        _.forEach(all, function (value, index) {
          if (value['Issue Key'] === config.ID) {
            var subConfig = {};
            subConfig.ExecutedBy = value['Executed By'];
            subConfig.ExecutedOn = value['Executed On'];
            subConfig.StepResult = value['Step Result'];
            subConfig.OrderId = value.OrderId;
            subConfig.Step = value.Step;
            subConfig.TestData = value['Test Data'];
            subConfig.ExpectedReault = value['Expected Result'];
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
      process.argv[5], process.argv[6], process.argv[7]);
  }
})();
