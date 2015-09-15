/*global giant */
(function () {
    "use strict";

    module("GlobalUtils");

    test("Adding global functions", function () {
        var constName = 'x' + Math.random(),
            functions = {},
            func = function () {
            };

        functions[constName] = 'foo';

        throws(function () {
            giant.addGlobalFunctions(functions);
        }, "should throw exception on invalid functions");

        functions[constName] = func;

        strictEqual(giant.addGlobalFunctions(functions), giant, "should be chainable");
        strictEqual(giant[constName], func, "should set function");
    });

    test("Adding global constants", function () {
        var constName = 'x' + Math.random(),
            constants = {};

        constants[constName] = true;

        strictEqual(giant.addGlobalConstants(constants), giant, "should be chainable");
        equal(giant[constName], true, "should set constant value");

        throws(function () {
            giant.addGlobalConstants(constants);
        }, "should raise exception on re-adding constant");
    });
}());
