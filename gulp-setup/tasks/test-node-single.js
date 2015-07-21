'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var yargs = require('yargs');
var _ = require('underscore');

var argv = yargs.argv;

gulp.task('test:node:single', "Run a single node test without coverage", function() {
    if (_.isUndefined(argv.test)) {
        console.log('   ERROR!  Usage: "gulp test:node:single --test testFileName"');
    } else {
        var testName = argv.test;
        if (testName.indexOf('.spec.js') === -1) {
            testName = testName + '.spec.js';
        }

        return gulp.src(['./spec/setup.js', './spec/**/' + testName], {read: false})
            .pipe(mocha({reporter: 'spec'}));
    }
});