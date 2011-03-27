/*
 * Date: 26-Mar-2011
 * Author: Anders Thøgersen
 * email: NaOnSdPeArMslt@gmail.com -- remove NOSPAM
 */

var _        = require('underscore'),
    vows     = require('vows'),
    util     = require('util'),
    assert   = require('assert'),
    fs       = require('fs'),
    log      = function (x) {
        util.puts(util.inspect(x, false, 12));
    },
    fcompose = require('./fcompose'),
    
    compose  = fcompose.compose,
    $apply   = fcompose.$apply,
    $string  = fcompose.$string,
    $prefix  = fcompose.$prefix,
    $length  = fcompose.$length,
    $filter  = fcompose.$filter,
    $split   = fcompose.$split,
    $join    = fcompose.$join,
    $it      = fcompose.$it,
    $ifelse  = fcompose.$ifelse,
    $return  = fcompose.$return,
    $exists  = fcompose.$exists,
    _gt      = fcompose._gt,
    _not     = fcompose._not,

    acompose = fcompose.acompose
    ;

vows.describe('Compose synchronous functions').addBatch({
    'Funky tests': {
        'topic': "this is a nice string that can be manipulated for fun",
        'splitter filter': function (str) {
            var fn = compose($split(/ /), $filter(/^t/));
            assert.deepEqual(fn(str), ['this', 'that']);
        },
        'it': function (str) {
            assert.equal(compose($it)(str), str);
        },
        'ifelse': function (str) {
            var fn1 = compose($split(/ /), $filter(/^t/), $length, $ifelse(_gt(1), $return('greater'), $return('not greater'))),
                fn2 = compose($split(/ /), $filter(/^t/), $length, $ifelse(_not(_gt(1)), $return('greater'), $return('not greater')));
            log(fn1(str));
            log(fn2(str));
        }
    }
})['export'](module);

// var fn = compose($split(/-/, $filter(/^a/)));

// log(fn('aa-bb-ff-gg-aa-dd-a2-f5-a2'));

// var toFile = compose(fs.writeFile)
var onError    = compose($prefix('ERROR: '), console.log),
    acatFile3  = acompose(onError, $exists, fs.readFile, compose($string, $prefix('PREFIX: '), console.log)),
    awriteFile = acompose(onError, $exists, compose($prefix('Foo '), console.log), console.log)
    ;

onError('Foo');

acatFile3('testfile');
awriteFile('testfile');



