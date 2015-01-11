'use strict';

var gulp = require('gulp');
var webpack = require('gulp-webpack');
var rename = require('gulp-rename');

gulp.task('dist', "Create distribution", ['bower'], function () {
  return gulp.src('src/backbone.conduit.js')
    .pipe(webpack({
      output: { libraryTarget: 'umd' },
      externals:  {
        backbone: {
          amd: 'backbone',
          commonjs: 'backbone',
          commonjs2: 'backbone',
          root: 'Backbone'
        },
        underscore: {
          amd: 'underscore',
          commonjs: 'underscore',
          commonjs2: 'underscore',
          root: '_'
        }
      }
    }))
    .pipe(rename('backbone.conduit.js'))
    .pipe(gulp.dest('dist'));
});