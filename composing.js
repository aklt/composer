/*
 * Date: 27-Mar-2011
 * Author: Anders Thøgersen
 * email: NaOnSdPeArMslt@gmail.com -- remove NOSPAM
 */


// TODO - All functions shuold take a single value and an array, like $prefix

/*global console*/

var fs     = require('fs'),
    path   = require('path'),
    childp = require('child_process'),
    log    = console.log
    ;

/**
* Compose synchronous functions::
*
*   var fn     = compose(context, firstFunction, secondFunction, ...),
*       result = fn(arg1, arg2, ...);
*
* Does ...(secondFunction(firstFunction(arg1, arg2, ...)))
*/
function compose(/* ... */) {
    var run = [].slice.call(arguments),
        context;
    
    if (typeof run[0] === 'object') {
        context = run.shift();
    }

    return function () {
        var args = [].slice.call(arguments),
            result = run[0].apply(context, args);

        for  (var i = 1, i_max = run.length; i < i_max; i += 1) {
            result = run[i].apply(context, [result]);
        }
        return result;
    };
}

/**
* Compose asynchronous functions::
*
*     var fn  = acompose(errorFunc, asyncFun1, asyncFun2, ..., syncFunc),
*         res = fn(arg1, arg2, ...);
*/
function acomposeHelper(args) {
    var onError  = args.shift();

    var run = [];
    for (var i = 0, i_max = args.length; i < i_max; i += 1) {
        run[i] = function (/* args */) { 
            var that = this,
                myargs = [].slice.call(arguments);
            if (that.__callback) {
                myargs.push(function (err, output) {
                    if (err) {
                        return onError(err);
                    }
                    return that.__callback.call(that.__callback, output);
                });
                args[that.__idx].apply(null, myargs);
            } else {
                return args[that.__idx].apply(null, myargs);
            }
        };
    }

    for (var j = 0, j_max = run.length - 1; j < j_max; j += 1) {
        run[j].__callback = run[j + 1];
        run[j].__idx = j;
    }
    run[j].__idx = j;
    return run[0];
}

function acompose() {
    var args = [].slice.call(arguments),
        fn   = acomposeHelper(args);

    return function () {
        var vars = [].slice.call(arguments);
        if (fn.__callback) {
            return fn.__callback.apply(fn, vars);
        }
        return fn.apply(fn, vars);
    };
}

// Courtesy of vows code
var esc = String.fromCharCode(27),
    styles = {
    'bold'      : [1,  22],
    'italic'    : [3,  23],
    'underline' : [4,  24],
    'cyan'      : [96, 39],
    'yellow'    : [33, 39],
    'green'     : [32, 39],
    'red'       : [31, 39],
    'grey'      : [90, 39],
    'green-hi'  : [92, 32],
};


// String functions
module.exports = {
    // Composing
    $: compose,
    _: acompose,
    // String functions
    $upper: function () {
        return function (string) {
            return string.toLocaleUpperCase();
        };
    },
    $lower: function () {
        return function (string) {
            return string.toLocaleLowerCase();
        };
    },
    $ucfirst: function () {
        return function (string) {
            var first = string[0].toLocaleUpperCase(),
            rest  = string.slice(1);
            return [first, rest].join('');
        };
    },
    $concat: function (arg) {
        return function (string) {
            return string.concat(arg);
        };
    },
    $split: function (rx) {
        return function (arg) {
            return arg.split(rx);
        };
    },
    $trim: function (string) {
        return string.trim();
    },
    $trimLeft: function (string) {
        return string.trimLeft();
    },
    $length: function () {
        return function (string) {
            return string.length;
        };
    },
    $trimRight: function () {
        return function (string) {
            return string.trimRight();
        };
    },
    $replace: function (find, replacement) {
        return function (string) {
            return string.replace(find, replacement);
        };
    },
    $search: function (find) {
        return function (string) {
            return string.search(find);
        };
    },
    $charAt: function (idx) {
        return function (string) {
            return string.charAt(idx);
        };
    },
    $codeAt: function (idx) {
        return function (string) {
            return string.charCodeAt(idx);
        };
    },
    $slice: function (start, end) {
        var args = [].slice.call(arguments);
        return function (string) {
            return string.slice.apply(this, args);
        };
    },
    $substr: function (start, end) {
        var args = [].slice.call(arguments);
        return function (string) {
            return string.slice.substr(this, args);
        };
    },
    $match: function (regex) {
        return function (string) {
            return string.match(regex);
        };
    },
    // Html generation -- dubious
    $link: function (url) {
        return function (string) {
            return string.anchor(url);
        };
    },
    $italics: function (string) {
        return string.italics();
    },
    $fixed: function (string) {
        return string.fixed();
    },
    $bold: function (string) {
        return string.bold();
    },
    // Other string functions
    $prefix: function (str) {
        return function (arg) {
            if (typeof arg === 'string') {
                return [str, arg].join('');
            }
            return arg.map(function (elem) {
                return [str, elem].join('');
            });
        };
    },
    $suffix: function (str) {
        return function (arg) {
            return [arg, str].join('');
        };
    },
    $surround: function (str1, str2) {
        if (! str2) {
            str2 = str1;
        }
        return function (arg) {
            return [str1, arg, str2].join('');
        };
    },
    $stylize: function (style) {
        return function (str) {
            return [esc, '[', styles[style][0], 'm', str, esc, '[', styles[style][1], 'm'].join('');
        };
    },
    // Array functions
    $join: function (delim) {
        return function (array) {
            return array.join(delim);
        };
    },
    $push: function (array) {
        return function (val) {
            return array.push(val);
        };
    },
    $pop: function (array) {
        return function () {
            return array.pop();
        };
    },
    $shift: function (array) {
        return function (value) {
            return array.shift(value);
        };
    },
    $unshift: function (value) {
        return function (array) {
            return array.unshift(value);
        };
    },
    $every: function (criteria) {
        return function (array) {
            return array.every(criteria);
        };
    },
    $some: function (criteria) {
        return function (array) {
            return array.some(criteria);
        };
    },
    $reduce: function (binOp) {
        return function (array) {
            return array.reduce(binOp);
        };
    },
    $filter: function (criteria) {
        if (criteria.compile) {
            // It's a regex
            return function (array) {
                return array.filter(function (elem) {
                    return criteria.test(elem);
                });
            };
        }
        // It's a function
        return function (array) {
            return array.filter(criteria);
        };
    },
    $map: function (func) {
        return function (array) {
            return array.map(func);
        };
    },
    $sort: function (sorter) {
    },
    $reverse: function () {
        return function (array) {
            return array.reverse();
        };
    },
    $splice: function (/* index, howmany, ... */) {
        var args = [].slice.call(arguments);
        return function (array) {
            return array.splice.apply(this, args);
        };
    },
    // Apply the function on each element of an array or on a single arg
    $each: function (func) {
        return function (arg) {
            if (Object.prototype.toString.call(arg) === '[object Array]') {
                return arg.map(func);
            }
            return func(arg);
        };
    },
    // boolean binOps
    $gt: function (val) {
        return function (that) {
            return that > val;
        };
    },
    $lt: function (val) {
        return function (that) {
            return that < val;
        };
    },
    $eq: function (val) {
        return function (that) {
            return that === val;
        };
    },
    $neq: function (val) {
        return function (that) {
            return that !== val;
        };
    },
    // Boolean logic
    $and: function (that) {
        return function (val) {
            return that && val;
        };
    },
    $or: function (that) {
        return function (val) {
            return val || that;
        };
    },
    $not: function () {
        return function (val) {
            return !(!!val);
        };
    },
    // Other logic
    $cond: function (conds) {
        return function (arg) {
            // TODO
        };
    },
    $if: function (cond, func) {
        var args = [].slice.call(arguments);
        if (args.length === 1) {
            return function () {
                return !!(args[0]);
            };
        }
        return function (arg) {
            if (cond(arg)) {
                return func(arg);
            }
        };
    },
    $ifelse: function (_if, _then, _else) {
        return function (arg) {
            if (_if(arg)) {
                return _then(arg);
            }
            return _else(arg);
        };
    },
    // End functions
    $string: function (arg) {
        return arg.toString();
    },
    $number: function (arg) {
        return parseInt(arg, 10);
    },
    $empty: function () {
        return;
    },
    // Curry helpers
    // Pass argument as the pos parameter
    $pass: function (func, arg, pos) {
        var index = pos || 0;
        return function (/* args*/) {
            var args = [].slice.call(arguments);
            args.splice(index, 0, arg);
            return func.apply(this, args);
        };
    },
    // Async library functions with nicer signatures
    _exists: function (full, callback) {
        path.exists(full, function (ok) {
            if (! ok) {
                return callback('Does not exist: "' + full + '"');
            }
            callback(null, full);
        });
    },
    _spawn: function (/* cmd, arg1, arg2, ... */) {
        var args = [].slice.call(arguments),
            cmd  = args.shift();

    },
    _exec: function (cmd) {
        childp.exec(cmd, function (err, stdout, stderr) {
            if (err) {
                cb('Exec failed: ' + stderr);
            }
            cb(stdout);
        });
    },
    _pipe: 23,
    $it: function () {
        var args = [].slice.call(arguments);
        if (args.length > 0) {
            return function () {
                return args[0];
            };
        }
    },
    // Collect the results of an async function in an array
    _each: function (onError, func, cb) {
        return function (array) {
            var result = [], done = array.length;
            for (var i = 0, i_max = array.length; i < i_max; i += 1) {
                (function (idx) {
                    func(array[idx], function (err, val) {
                        if (err) {
                            return onError(err);
                        }
                        result[idx] = val;
                        done -= 1;
                        if (done === 0) {
                            // TODO error
                            cb(result);
                        }
                    });
                }(i));
            }
        };
    },
    // Objects
    // Get properties of an object
    $props: function (/* properties */) {
        var props = [].slice.call(arguments);
        return function (obj) {
            var result = [];
            for  (var i = 0, i_max = props.length; i < i_max; i += 1) {
                var prop = props[i];
                if (prop in obj) {
                    result.push(obj[prop]);
                }
            }
            return result;
        };
    },
    // Get an object containing the properties mentioned
    $obj: function (/* props */) {
        var props = [].slice.call(arguments);
        return function (obj) {
            var result = {};
            for  (var i = 0, i_max = props.length; i < i_max; i += 1) {
                var prop = props[i];
                if (prop in obj) {
                    // TODO deep copy
                    result[prop] = obj[prop];
                }
            }
            return result;
        };
    },
    // Arrays - Take out elements from an array
    $take: function (/* args */) {
        var args = [].slice.call(arguments);
        if (args.length === 1) {
            return function (array) {
                return array[args[0]];
            };
        }
        return function (array) {
            var result = [];
            for  (var i = 0, i_max = args.length; i < i_max; i += 1) {
                result.push(array[args[i]]);
            }
            return result;
        };
    },
    $zip: function (array) {
        var l = [], r = [];
        for  (var i = 0, i_max = array.length; i < i_max; i += 2) {
            l.push(array[i]);
            r.push(array[i + 1]);
        }
        return [l, r];
    },
    $unzip: function (array) {
        var result = [], l = array[0], r = array[1];
        if (l.length > r.length) {
            var tmp = l;
            l = r;
            r = tmp;
        }
        for  (var i = 0, i_max = l.length; i < i_max; i += 1) {
            result.push(l[i], r[i]);
        }
        return result;
    },
    // Call a function and return its argument also
    $keep: function (func) {
        return function (/* args */) {
            var args = [].slice.call(arguments);
            args.push(func.apply(func, args));
            return args;
        };
    },
    // Apply function to argument list
    $apply: function (func) {
        return function (array) {
            return func.apply(null, array);
        };
    },
};

