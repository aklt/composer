#!/usr/bin/env node

/*
 * Date: 05-Apr-2011
 * Author: Anders Thøgersen
 * email: NaOnSdPeArMslt@gmail.com -- remove NOSPAM
 */

var _       = require('underscore'),
    fs      = require('fs'),
    path    = require('path'),
    util    = require('util'),
    assert  = require('assert'),
    log     = console.log,
    composer = require('./composer')
    ;

// Print a formatted error string
with (composer) {
    var errFun = $($surround('"'), $stylize('red'),   $prefix('Error: '), $stylize('bold'), log),
        msgFun = $($surround('"'), $stylize('green'), $prefix('Message: '), log);
}
errFun('This is not an error');

// Find all words in a file containing an uppercase character and print them
with (composer) {
    var getUpperCaseWords  = _(errFun, _exists, fs.readFile, $($string, $split(/ |\n/), $filter(/[A-Z]/), $join('\n'), msgFun));
}
getUpperCaseWords('testfile');

// Write data to a file
var writeData, filename = 'outfile';
with (composer) {
    writeData = _(errFun, $pass(fs.writeFile, filename, 'utf8'), $($it('Wrote file'), msgFun));
}
writeData('Hello world');

// Make a function to get the size and modification times of all files in a dir and print them. This way we can pass arguments:
with (composer) {
    var sizeAndMod = function (dir, callback) {
        _(errFun, fs.readdir, $($prefix(dir + '/'),
        _each(errFun, fs.stat, $($map($props('size', 'mtime')), callback))))(dir);
    }
}
sizeAndMod('/tmp', log);

// What if we also want the filename to go with that? ... We need a function to handle that.
with (composer) {
    var sizeModAndNames = function (dir, callback) {
        _(errFun, fs.readdir, $($prefix(dir + '/'), function (dirs) {
            _each(errFun, fs.stat, $($map($props('size', 'mtime')), $pass(callback, dirs)))(dirs);
        }))(dir);
    };
}
sizeModAndNames('/tmp', function (dirs, props) {
    log('Files: ', dirs);
    log('Props: ', props);
});

// Read a file, filter out line comments and write it to a outfile
with (composer) {
    var filterFile = function (infile, outfile) {
        _(errFun, _exists, fs.readFile, $($string, $split(/[\n\r]+/), $filter(/^\s*(?!#)/), $join('\n'),
        _(errFun, $pass(fs.writeFile, outfile))) )(infile);
    };
}
filterFile('testfile', 'testfile-filtered');


// Read a file with a list of files, stat the files and write the stats to a new file
with (composer) {
    var statDirs = function (infile, outfile) {
        _(errFun, _exists, fs.readFile, $($string, $split(/[\n\r]+/), $filter(/./),
        _each(msgFun, fs.stat, $($string, _(errFun, $pass(fs.writeFile, outfile))))))(infile);
    };
}
statDirs('statdirs.txt', 'statdirs.out');

