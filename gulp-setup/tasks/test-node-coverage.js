'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

gulp.task('test:node:coverage', "Run node tests with code coverage", function() {
    return gulp.src('./src/**/*.js')
        .pipe(istanbul({includeUntested: true}))
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            gulp.src(['./spec/setup.js', './spec/**/*.spec.js'], { read: false })
                .pipe(mocha({ reporter: 'spec' }))
                .pipe(istanbul.writeReports({
                    reporters: [ 'html', 'text-summary' ]
                }));
        })
});