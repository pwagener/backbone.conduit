/**
 * This module is meant to show performance improvements in Backbone collections
 */

// This is the test data we're going to use

var dataFilePath = "./test-data/2008-20K.json";
var data = require(dataFilePath);
var dataStr = JSON.stringify(data);
var NUM_ITERATIONS = 50;


var _ = require("underscore");
var timer = require("./lib/EventTimer");
var when = require("when");

// Wiring up Backbone with a usable jQuery is a bit of a mess....
var Backbone = require("backbone");
var jsdom = require("jsdom");
var doc = jsdom.jsdom("");
var window = doc.parentWindow;
var jQuery = require("jquery")(window);
Backbone.$ = jQuery;
var FakeXmlHttpRequest = require("fake-xml-http-request");


// Configure RequireJS so this performance test looks/feels like the Browser-y runtime
var requirejs = require("requirejs");
requirejs.config({
    nodeRequire: require
});
requirejs([
    "./lib/QuickStartCollection"
], function(QuickStartCollection) {

    // Trick jQuery into doing our bidding
    jQuery.support.cors = true;
    jQuery.ajaxSettings.xhr = function() {
        var fakeXMLHttpRequest = new FakeXmlHttpRequest();
        _.delay(function() {
            fakeXMLHttpRequest.respond(200, {
                "Content-Type": "application/json;charset=UTF-8"
            }, dataStr)
        }, 10);

        return fakeXMLHttpRequest;
    };


    var BasicCollection = Backbone.Collection.extend({
        url: "foo"
    });

    var ComparisonCollection = QuickStartCollection.extend({
        url: "bar"
    });

    function runTestLoop(CollectionType) {
        return when.promise(function(resolve, reject) {
            var finished = 0;
            for (var i = 0; i < NUM_ITERATIONS; i++) {
                (function() {
                    var collection = new CollectionType();
                    collection.fetch({
                        success: function() {
                            finished++;
                            if (finished == NUM_ITERATIONS) {
                                resolve();
                            }
                        },
                        error: function(err) {
                            reject(err);
                        }
                    });
                })();
            }
        });
    }

    console.log("Using data in '" + dataFilePath + "'");
    console.log("Using " + NUM_ITERATIONS + " iterations");
    var basicTest = timer.start("Basic Collection");
    runTestLoop(BasicCollection).then(function() {
        timer.end(basicTest);
        timer.logEvent(basicTest);

        var quickStartTest = timer.start("Quickstart Collection");
        runTestLoop(ComparisonCollection).then(function() {
            timer.end(quickStartTest);
            timer.logEvent(quickStartTest);

            timer.logDifference(basicTest, quickStartTest);
        });
    }).catch(function(err) {
        console.log("D'oh: ", err);
    });
});