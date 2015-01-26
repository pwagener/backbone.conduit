
// Default test data
var DEFAULT_DATA_FILE = "./data/2008-20K.json";

// Wiring up Backbone with a usable jQuery is a bit of a mess....
var wiring = require('./wiring');
var Backbone = wiring.Backbone;
var BackboneLodash = wiring.BackboneLodash;
var Conduit = require("./../dist/backbone.conduit");

var Benchmark = require('benchmark');

var data = require(DEFAULT_DATA_FILE);
function makeTestFunction(CollectionType, methodName, options) {
    options = options || {};

    return function() {
        var collection = new CollectionType();
        collection[methodName](data);
    };
}

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
            //var percentDiff = Math.round((fastest.hz / benchmark.hz) * 100);
            var percentDiff = Math.round(((fastest.hz - benchmark.hz) / fastest.hz) * 100);
            console.log('    --> ' + percentDiff + '% faster than ' + current);
        }
    });

    console.log('----');
}


var addOpts = { minSamples: 20 };
var resetRefillSuite = new Benchmark.Suite();
resetRefillSuite
    .add('Backbone..reset', makeTestFunction(Backbone.Collection, 'reset'), addOpts)
    .add('Backbone w/Lodash..reset', makeTestFunction(BackboneLodash.Collection, 'reset'), addOpts)
    .add('Conduit..refill', makeTestFunction(Conduit.Collection, 'refill'), addOpts)
    // add listeners
    .on('cycle', onSuiteCycle)
    .on('complete', function() {
        onSuiteComplete(this);
    });

var setFillSuite = new Benchmark.Suite();
setFillSuite
    .add('Backbone..fill', makeTestFunction(Backbone.Collection, 'set'), addOpts)
    .add('Backbone w/Lodash..fill', makeTestFunction(BackboneLodash.Collection, 'set'), addOpts)
    .add('Conduit..fill', makeTestFunction(Conduit.Collection, 'fill'), addOpts)
    // add listeners
    .on('cycle', onSuiteCycle)
    .on('complete', function() {
        onSuiteComplete(this);
    });

module.exports = {
    runTests: function(done) {
        console.log("Sit back & relax while we shove large data through small pipes...");

        console.log('... Comparing reset & refill:');
        resetRefillSuite.run();

        console.log('... Comparing set & fill:');
        setFillSuite.run();
        done();
    }
};
