'use strict';

var gulp = require('gulp');
var karma = require('karma').server;

gulp.task('test:browser', 'Run browser-specific tests', ['test:browser:bundle'], function (done) {
    karma.start({
        configFile: process.env.PWD + '/karma.conf.js',
        singleRun: +process.env.KARMA_DEBUG !== 1
    }, done);
});