#Compose functions

This lib allows creating functions by composition:

    var fs       = require('fs'),
        composer = require('./composer'),
        log      = console.log;

    with (composer) {
        var errFun             = $($surround('"'), $stylize('red'),   $prefix('Error: '), $stylize('bold'), log),
            msgFun             = $($surround('"'), $stylize('green'), $prefix('Message: '), log);
            getUpperCaseWords  = _(errFun, _exists, fs.readFile, $($string, $split(/\W+/), $filter(/^[A-Z]/), $join('\n\t'), msgFun));
    }

The last function can be run with a filename as argument:

    getUpperCaseWords('README.md');

The arguments to the `$` function are executed as a line of functions where each
taks as argument the output of the previous function.  Other functions that begin with
`$` are  sequetial as well.

The argumens to the asynchronous comopser `_`, should be:


    _(errorFunction, asyncFunction1, asyncFunction2,..., syncFunction)`.


If one of the  asyncFunctions errors, `errorFunction` will be run.

    _ denotes an async function.

    $ denotes a synchronous function.

##TODO

 - All $ functions should allow both a single value and an array of values to be
   passed.

 - `_` collides with `underscore.js`


