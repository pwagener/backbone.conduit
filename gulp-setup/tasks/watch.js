'use strict';

var gulp = require('gulp');

gulp.task('watch', 'Watch JS & test directory & rerun tests automatically', function (done) {
  var watcher = gulp.watch(
      [
        'spec/**/*.js',
        'lib/**/*.js'
      ],
      ['test']);
  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tests... ');
  });
  console.log('Watching Test & JS Files; CTRL-C to stop');

    // Note this task never exits
});
