'use strict';

// Wrap gulp in gulp-help for all future tasks
require('gulp-help')(require('gulp'));

// Set all tasks provided
var fs = require('fs');
var tasks = fs.readdirSync('./gulp-setup/tasks');
tasks.forEach(function(task) {
  require('./tasks/' + task);
});
