#! /usr/bin/env node
var shell = require("shelljs");

// Remove any generated content
shell.exec('rm -rf target');

// Build Distributables.  TODO:  would be nice to get rid of 'gulp'
shell.exec('gulp dist');

shell.exec('mkdir target');

// Build Docs
shell.exec('gitbook install site/docs');
shell.exec('gitbook build site/docs target/docs');

// Build the PDF
shell.exec('gitbook pdf site/docs target/docs/backbone-conduit.pdf');

// TODO:  would be nice to build a Single Page html

// Copy over examples in a workable way
shell.exec('cp -r site/public/* target/.');

// Copy distributables
shell.exec('cp dist/*.js target/lib/.');
