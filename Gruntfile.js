/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        files: [
            'js/namespace.js',
            'js/Feature.js',
            'js/Base.js',
            'js/Memoization.js',
            'js/Surrogate.js',
            'js/Instantiation.js',
            'js/Properties.js',
            'js/AmendUtils.js',
            'js/BuiltInUtils.js',
            'js/Postpone.js',
            'js/exports.js'
        ],

        test: [
            'js/jsTestDriver.conf'
        ],

        globals: {}
    };

    // invoking common grunt process
    require('common-gruntfile')(grunt, params);
};
