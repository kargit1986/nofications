'use strict';
var http = require('http');
var request = require('request');
var vault = require('./vault.js')

var gitlabUrl = 'http://git.questrade.com/api/v4/projects/850/trigger/pipeline';
var token = '0bb67dad53fa26c0833567eded0a0c'
var masterBranch = 'master';

var isFirst = true;
var maxDateDiff = 10000; //10s between requests
var previousDate = Date.now();
var currentDate = Date.now();
var consul = require('consul')({
    "host": "10.33.67.12",
    "port" : 80
});
var port = 1339;

var watch = consul.watch({ method: consul.kv.get, options: { key: 'vault' } });
var options = {
    url: gitlabUrl,
    method: 'POST',
    form: {
        token: token,
        ref: masterBranch
    }
};

watch.on('change', function (data, res) {
    console.log('There is a change in Consul');
    currentDate = Date.now();
    var diffDate = currentDate - previousDate;
    if (!isFirst && diffDate > maxDateDiff) {
        previousDate = currentDate;
        console.log(`${previousDate}  ${currentDate}  ${diffDate}`)
        vault.processSecrets();
        //request(options, function (error, response, body) {
         //   console.log("fired");
        //});
    }
    isFirst = false;
});

watch.on('error', function (err) {
    console.log('error:', err);
});

//curl - X POST \
//-F token = 0bb67dad53fa26c0833567eded0a0c \
//http://git.questrade.com/api/v4/projects/850/trigger/pipeline
