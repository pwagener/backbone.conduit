
var data = require("../data/2008-20K.json");

var Backbone = require('backbone');
var Conduit = require('./../../dist/backbone.conduit');


var bbCollection = new Backbone.Collection(data);
bbCollection.comparator = 'Origin';

Conduit.config.setUnderscorePath('/base/node_modules/underscore/underscore.js');
var coCollection = new Conduit.Collection(data);
coCollection.comparator = 'Origin';

var sortAsyncSuite = new Benchmark.Suite();
sortAsyncSuite
    .add('Backbone..sort', function(deferred) {
        bbCollection.sort();
        deferred.resolve();
    }, { minSamples: 20, defer: true})
    .add('Conduit..sortAsync', function(deferred) {
        coCollection.sortAsync().then(function() {
            deferred.resolve();
        })
    }, { minSamples: 20, defer: true })
    .on('cycle', function(event) {
        console.log('  ' + String(event.target));
    })
    .on('complete', function(event) {
        var suite = event.currentTarget;
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
    });

sortAsyncSuite.run();