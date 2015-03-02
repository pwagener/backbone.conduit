'use strict';

var gulp = require('gulp');
var webpack = require('gulp-webpack');
var rename = require('gulp-rename');

gulp.task('test:browser:bundle', false, ['link'], function () {
    // TODO:  so, we're basically just copying the worker file.  WTF?
    gulp.src('./src/worker/worker.js')
        .pipe(webpack({
            output: {
                filename: 'browserSpec-worker.bundle.js'
            },
            devtool: 'inline-source-map'
        }))
        .pipe(gulp.dest('./spec/browser'));

    return gulp.src('./spec/browser/setup.js')
        .pipe(webpack({
            output: {
                filename: 'browserSpec.bundle.js'
            },
            devtool: 'inline-source-map'
        }))
        .pipe(gulp.dest('./spec/browser'));

    // TODO: how to marry these two?  Or should we even mary these two?
    // maybe the worker is in a separate file
});
