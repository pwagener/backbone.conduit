'use strict';

var gulp = require('gulp');
var performance = require('./../../test/performance');

// Run performance tests
gulp.task('test:performance', 'Run performance tests', function(done) {
    console.log("Performance tests take a few minutes; please be patient");
    performance.runTests({
        numIterations: 2
    }, done);
});

