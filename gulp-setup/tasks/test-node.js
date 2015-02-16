'use strict';

var mocha = require('gulp-mocha');
var gulp = require('gulp');

gulp.task('test:node', "Run node tests", function() {
    return gulp.src(['./spec/setup.js', './spec/**/*.spec.js'], { read: false })
        .pipe(mocha({ reporter: 'spec' }));
});