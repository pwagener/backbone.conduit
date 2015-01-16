'use strict';

var gulp = require('gulp');
var performance = require('./../../perf/perf');

// Run performance tests
gulp.task('test:performance', 'Run performance tests', ['dist'], function(done) {
    console.log("Performance tests take a few minutes; please be patient");
    performance.runTests({
        numIterations: 10
    }, done);
});

