/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        files: [
            'src/namespace.js',
            'src/Feature.js',
            'src/Base.js',
            'src/Memoization.js',
            'src/Surrogate.js',
            'src/Instantiation.js',
            'src/Properties.js',
            'src/AmendUtils.js',
            'src/BuiltInUtils.js',
            'src/Postpone.js',
            'src/exports.js'
        ],

        test: [
            'src/jsTestDriver.conf'
        ],

        globals: {}
    };

    // invoking common grunt process
    require('common-gruntfile')(grunt, params);
};
