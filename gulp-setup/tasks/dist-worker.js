'use strict';

/*
 This task is subservient to 'dist'.  It creates the 'backbone.conduit-worker.js'
 distribution file.
 */
var gulp = require('gulp');
var webpack = require('gulp-webpack');

gulp.task('dist:worker', false, ['bower'], function () {
    return gulp.src('src/worker/worker.js')
        .pipe(webpack({
            output: {
                filename: 'backbone.conduit-worker.js'
            }
        }))
        .pipe(gulp.dest('dist'));
});