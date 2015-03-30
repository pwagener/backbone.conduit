'use strict';

var mocha = require('gulp-mocha');
var gulp = require('gulp');

gulp.task('test', "Run all tests", ['test:node:coverage', 'test:browser']);