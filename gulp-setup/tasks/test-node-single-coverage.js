'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var yargs = require('yargs');
var _ = require('underscore');

var argv = yargs.argv;

gulp.task('test:node:single:coverage', "Run a single test with coverage", function() {
    if (_.isUndefined(argv.test)) {
        console.log('   ERROR!  Usage: "gulp test:node:single:coverage --test testFileName"');
    } else {
        var rootName = argv.test;
        var testName = rootName;
        if (testName.indexOf('.spec.js') === -1) {
            testName = testName + '.spec.js';
        }
        var toSrcName = rootName + '.js';


        return gulp.src('./src/**/' + toSrcName)
            .pipe(istanbul({includeUntested: true}))
            .pipe(istanbul.hookRequire())
            .on('finish', function () {
                gulp.src(['./spec/setup.js', './spec/**/' + testName], {read: false})
                    .pipe(mocha({reporter: 'spec'}))
                    .pipe(istanbul.writeReports({
                        reporters: ['html', 'text-summary']
                    }));
            });
    }
});