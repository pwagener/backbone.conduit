/**
 * This module reports on performance comparisons between Backbone Collections
 * and Conduit Collections.
 */
// Default test data
var DEFAULT_DATA_FILE = "./data/2008-100K.json";
var DEFAULT_NUM_ITERATIONS = 5;

var _ = require("underscore");
var when = require("when");
// Wiring up Backbone with a usable jQuery is a bit of a mess....
var wiring = require('./wiring');
var Backbone = wiring.Backbone;
var BackboneLodash = wiring.BackboneLodash;

var timer = require("./EventTimer");
var Conduit = require("./../src/backbone.conduit");

// The test we will run
function makeTestPromise(CollectionType, funcName, options) {
    options = options || {};
    var dataFile = options.dataFile || DEFAULT_DATA_FILE;
    var data = require(dataFile);
    var numIterations = options.numIterations || DEFAULT_NUM_ITERATIONS;
    var testName = options.testName || (numIterations + " Iteration Test");

    return when.promise(function(resolve) {
        var testTimer = timer.start(testName);
        for (var i = 0; i < numIterations; i++) {
            var collection = new CollectionType();
            collection[funcName](data);
        }
        timer.end(testTimer);

        resolve({
            name: testName,
            timer: testTimer
        });
    });
}

function runTests(options, callback) {
    options = options || {};

    var promises = [];

    promises.push(makeTestPromise(Conduit.Collection, "refill", _.extend({
        testName: "Conduit..refill"
    }, options)));

    promises.push(makeTestPromise(Backbone.Collection, 'reset', _.extend({
        testName: "Backbone..reset"
    }, options)));

    promises.push(makeTestPromise(BackboneLodash.Collection, 'reset', _.extend({
        testName: 'Backbone-Lodash..reset'
    }, options)));

    when.all(promises).then(function(results) {
        var timers = _.pluck(results, "timer");
        timer.logComparison(timers);
        if (callback) {
            callback();
        }
    }).catch(function(err) {
        console.log("D'oh: ", err);
    });
}

module.exports = {
    runTests: runTests
};
