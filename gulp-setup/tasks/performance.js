'use strict';

var gulp = require('gulp');
var performance = require('./../../perf/perf');

// Run performance tests
gulp.task('test:performance', 'Run performance tests', ['dist'], function(done) {
    performance.runTests(done);
});

