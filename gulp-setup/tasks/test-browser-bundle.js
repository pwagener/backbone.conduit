'use strict';

var gulp = require('gulp');
var webpack = require('gulp-webpack');
var rename = require('gulp-rename');

gulp.task('test:browser:bundle', false, ['link'], function () {
    return gulp.src('./spec/browser/setup.js')
        .pipe(webpack({ devtool: 'inline-source-map' }))
        .pipe(rename('browserSpec.bundle.js'))
        .pipe(gulp.dest('./spec/browser'));
});
