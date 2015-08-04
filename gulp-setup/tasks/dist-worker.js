'use strict';

/*
 This task is subservient to 'dist'.  It creates the 'backbone.conduit-worker.js'
 distribution file.
 */
var gulp = require('gulp');
var webpack = require('gulp-webpack');

gulp.task('dist:worker', false, ['bower'], function () {
    // Produce the core worker
    gulp.src('src/worker/index.js')
        .pipe(webpack({
            output: {
                filename: 'backbone.conduit-worker.js'
            }
        }))
        .pipe(gulp.dest('dist'));

    // Produce the dataManagement component
    gulp.src('src/worker/data/index.js')
        .pipe(webpack({
            output: {
                filename: 'conduit.worker.data.js'
            }
        }))
        .pipe(gulp.dest('dist'));
});