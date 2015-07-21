'use strict';

var gulp = require('gulp');
var gulpCopy = require('gulp-copy');

gulp.task('dist:examples', 'Create examples', ['dist:library', 'dist:worker'], function() {
    return gulp.src('dist/*.js')
        .pipe(gulpCopy('examples/public/lib', {
            prefix: 1
        }));

});