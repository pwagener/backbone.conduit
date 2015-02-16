'use strict';

var gulp = require('gulp');
var webpack = require('gulp-webpack');
var rename = require('gulp-rename');

gulp.task('perf:browser:bundle', false, ['link'], function () {
    return gulp.src('./perf/browser/setup.js')
        .pipe(webpack({ devtool: 'inline-source-map' }))
        .pipe(rename('browserPerf.bundle.js'))
        .pipe(gulp.dest('./perf/browser'));
});
