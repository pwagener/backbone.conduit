/**
 * This module provides a variety of things used on performance tests
 */
'use strict';

var jsdom = require("jsdom");
var doc = jsdom.jsdom("");
var jQuery = require("jquery")(doc.parentWindow);

var Backbone = require("backbone");
Backbone.$ = jQuery;

var BackboneLodash = require("backbone-lodash");
BackboneLodash.$ = jQuery;

var Benchmark = require('benchmark');

var Conduit = require("./../src/index");

// Default test data
var DEFAULT_DATA_FILE = "./data/2008-20K.json";
var data = require(DEFAULT_DATA_FILE);

function onSuiteCycle(event) {
    console.log('  ' + String(event.target));
}

function onSuiteComplete(suite) {
    var fastest = suite.filter('fastest')[0];
    var fastestName = fastest.name;
    console.log('Fastest: ' + fastestName);
    suite.forEach(function(benchmark) {
        if (benchmark !== fastest) {
            var current = benchmark.name;
            var percentDiff = Math.round(((fastest.hz - benchmark.hz) / fastest.hz) * 100);
            console.log('    --> ' + percentDiff + '% faster than ' + current);
        }
    });

    console.log('----');
}

function createAndCallFunc(CollectionType, methodName) {
    return function() {
        var collection = new CollectionType();
        collection[methodName](data);
    };
}


function createSuite() {
    return new Benchmark.Suite()
        .on('cycle', onSuiteCycle)
        .on('complete', function () {
            onSuiteComplete(this);
        });
}

module.exports = {
    Conduit: Conduit,

    Backbone: Backbone,

    BackboneLodash: BackboneLodash,

    Benchmark: Benchmark,

    createSuite: createSuite,

    createAndCallFunc: createAndCallFunc,

    testData: data
};