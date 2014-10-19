var
    gulp = require('gulp-help')(require('gulp')),
    qunit = require('gulp-qunit'),
    nodemon = require('gulp-nodemon');

// Run Q-Unit tests
gulp.task('test', 'Run unit tests via Node', function() {
    return gulp
        .src('./test/test.html')
        .pipe(qunit());
});

// Watch tests directory for changes
gulp.task("watch", 'Watch JS test directory & rerun tests automatically', function() {
    var watcher = gulp.watch('test/**/*.js', ['test']);
    watcher.on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tests... ');
    });
    console.log('Watching test/**/*.js; CTRL-C to stop');
});

// Run performance tests
gulp.task('perf', 'Run performance tests via Node', function() {
    nodemon({
        script: 'perf.js'
    });
});

gulp.task('default', 'runs unit tests via Node', ['test']);
