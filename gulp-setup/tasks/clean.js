'use strict';

var gulp = require('gulp');
var del = require('del');

gulp.task('clean', "Remove built files", function (cb) {
  del([
    'dist'
  ], cb);
});