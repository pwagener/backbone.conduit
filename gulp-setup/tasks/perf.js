'use strict';

var gulp = require('gulp');
var performance = require('./../../perf/perf');

// Run performance tests
gulp.task('perf', 'Run performance comparisons', ['dist'], function(done) {
    performance.runTests(done);
});

