#!/usr/bin/env node

/*
 * Date: 27-Mar-2011
 * Author: Anders Thøgersen
 * email: NaOnSdPeArMslt@gmail.com -- remove NOSPAM
 */

var _       = require('underscore'),
    b       = require('backbone'),
    fs      = require('fs'),
    path    = require('path'),
    util    = require('util'),
    assert  = require('assert'),
    log     = console.log,
    compose = require('./composing')
    ;


// Print a formatted error string
var errFun, inBrowser;
with (compose) {
    errFun = $($surround('"'), $stylize('red'), $prefix('Error: '), $stylize('bold'), console.log);
}
errFun('Testing error');

// Find all te uppercase words in a file
var getUpperCaseWords;
with (compose) {
    getUpperCaseWords  = _(errFun, _exists, fs.readFile, $($string, $split(/ |\n/), $filter(/[A-Z]/), $join('\n'), console.log));
}
getUpperCaseWords('testfile');

// Write data to a file
var writeData, filename = 'outfile';
with (compose) {
    writeData = _(errFun, $pass(fs.writeFile, filename, 'utf8'), $($it('Wrote file'), console.log));
}
writeData('Hello world');

// Get the size and modification times of all files in a dir and print them
var sizeAndMod, get;
with (compose) {
    sizeAndMod = _(errFun, fs.readdir, $($prefix('/'), _each(errFun, fs.stat, $($map($props('size', 'mtime'))))));
}
// log(sizeAndMod('/'));

// What if we also want the filename to go with that? ... it gets more ugly.
var readdir, keeper, dir = './testfiles';
with (compose) {
    keeper = function (errFun, dir, cb) {
        _(errFun, fs.readdir, $($prefix(dir + '/'), function (dirs) {
            _each(errFun, fs.stat, $($map($props('size', 'mtime', 'mode')), $pass(cb, dirs)))(dirs);
        }))(dir);
    };
}
keeper(errFun, '/tmp', function (dirs, props) {
    console.log(dirs, props);
});

// Read a file, filter out line comments and write it with a new suffix
var filterFile;
with (compose) {
    filterFile = function (infile, outfile) {
        _(errFun, _exists, fs.readFile, $($string, $split(/[\n\r]+/), $filter(/^(?!#)/), $join('\n'),
        _(errFun, $pass(fs.writeFile, outfile))))(infile);
    };
}

filterFile('testfile', 'testfile-filtered');


// Append the suffix to all files matching a regex
var appendSuffix;
with (compose) {
    appendSuffix = function (onErr, dir, match, suffix) {

    }
}

