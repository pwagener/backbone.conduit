#!/usr/bin/env node


// App to convert a CSV to the format we want
var Transform = require('stream').Transform;
var Converter = require("csvtojson").Converter;
var fs = require("fs");
var _ = require('underscore');
var truncate = require('truncate');
var util = require('util');

var argv = process.argv;
if (argv.length < 3) {
    console.log("Please provide the CSV file to convert");
    process.exit(1);
}

var maxToConvert;
if (argv.length === 4) {
    maxToConvert = parseInt(argv[3]);
}

var csvFile = argv[2];

var fileSuffix = '';
if (maxToConvert) {
    fileSuffix = '-' + maxToConvert;
}
var jsonFile = csvFile.replace(".csv", fileSuffix + ".json");

var fileStream = fs.createReadStream(csvFile);
var outStream = fs.createWriteStream(jsonFile);

var csvConverter = new Converter({
    constructResult: false,
    toArrayString: true
});


var deleteFields = function(context, fields) {
    _.each(fields, function(field) {
        delete context[field];
    })
};

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function convert(result) {
    result.name = truncate(toTitleCase(result.DBA), 20, { ellipsis: ''}).trim();
    result.zip = result.ZIPCODE;
    result.grade = result.GRADE;
    result.date = result['GRADE DATE'];

    deleteFields(result, [
        'DBA', 'ZIPCODE', 'GRADE', 'GRADE DATE'
    ]);
}

//noinspection JSUnusedLocalSymbols
function onRecordParsed(result, raw, rowNum) {
    if (maxToConvert && rowNum > maxToConvert) {
        console.log('Skipping all rows after ' + maxToConvert);
        csvConverter.removeListener('record_parsed', onRecordParsed);
        // Rip out the flushBuffer implementation so we don't write any more lines.
        csvConverter.flushBuffer = function() { };
        csvConverter.end();
    } else {
        if (rowNum && rowNum % 1000 == 0) {
            console.log("Parsing row: " + rowNum);
        }
        convert(result);
    }
}

csvConverter.on("record_parsed", onRecordParsed);
csvConverter.on("end_parsed", function() {
    console.log("Parsed " + csvFile + " into " + jsonFile);
});


// Provide a transformer that will remove newlines
// Modified from this SO:
//    http://stackoverflow.com/questions/17363206/node-js-how-to-delete-first-line-in-file
function NewLineRemover(args) {
    if (!(this instanceof NewLineRemover)) {
        return new NewLineRemover(args);
    }
    Transform.call(this, args);
    this._buff = '';
}
util.inherits(NewLineRemover, Transform);

//noinspection JSUnusedGlobalSymbols
NewLineRemover.prototype._transform = function(chunk, encoding, done) {
    this._buff += chunk.toString();

    if (this._buff.indexOf('\n') !== -1) {
        // Strip the newline & push it on
        var result = this._buff.replace(/\n/g, '');
        this.push(result);
        this._buff = '';
    }

    done();
};

fileStream.pipe(csvConverter)
    .pipe(new NewLineRemover())
    .pipe(outStream);