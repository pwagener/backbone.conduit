'use strict';

var gulp = require('gulp');
var webpack = require('gulp-webpack');

gulp.task('test:browser:bundle', false, ['dist:worker', 'link'], function () {
    return gulp.src('./spec/browser/setup.js')
        .pipe(webpack({
            output: {
                filename: 'browserSpec.bundle.js'
            },
            devtool: 'inline-source-map'
        }))
        .pipe(gulp.dest('./spec/browser'));
});
