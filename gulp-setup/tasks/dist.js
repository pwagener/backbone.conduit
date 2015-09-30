'use strict';

var gulp = require('gulp');

gulp.task('dist', "Create distribution", ['dist:library', 'dist:worker']);