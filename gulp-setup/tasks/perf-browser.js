'use strict';

var gulp = require('gulp');
var karma = require('karma').server;

gulp.task('perf:browser', 'Run browser-specific performance tests', ['perf:browser:bundle'], function (done) {
    karma.start({
        configFile: process.env.PWD + '/karma.perf.conf.js',
        singleRun: +process.env.KARMA_DEBUG !== 1
    }, done);
});