'use strict';

/*
This task is subservient to 'dist'.  It creates the 'backbone.conduit.js'
distribution file.
 */

var gulp = require('gulp');
var webpack = require('gulp-webpack');

gulp.task('dist:library', false, ['bower'], function () {
    return gulp.src('src/index.js')
        .pipe(webpack({
            output: {
                filename: 'backbone.conduit.js',
                libraryTarget: 'umd'
            },
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
        .pipe(gulp.dest('dist'));
});