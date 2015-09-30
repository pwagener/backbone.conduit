#! /usr/bin/env node
var shell = require("shelljs");


// Upload all of 'target' to the S3 bucket
shell.exec('aws --profile personal s3 sync --exclude "*node_modules*" --delete target s3://conduit.wagener.org');