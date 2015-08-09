'use strict';

var gulp = require('gulp');
var util = require('util');
var child_process = require('child_process');

gulp.task('link', false, function () {
    var srcDir = process.env.PWD;
    var cmd = util.format('ln -s -f %s/src %s/node_modules', srcDir, srcDir);
    console.log(cmd);
    child_process.execSync(cmd);
});