'use strict';

var mocha = require('gulp-mocha');
var gulp = require('gulp');

gulp.task('test', "Run tests", function() {
    return gulp.src(['./spec/setup.js', './spec/**/*.spec.js'], { read: false })
        .pipe(mocha({ reporter: 'spec' }));
});

// TODO:  create a compatibility test suite to run the qunit tests from Backbone
//    return gulp.src('./test/test.html')
//        .pipe(qunit());
//});