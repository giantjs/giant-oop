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
            $oop.addGlobalFunctions(functions);
        }, "should throw exception on invalid functions");

        functions[constName] = func;

        strictEqual($oop.addGlobalFunctions(functions), $oop, "should be chainable");
        strictEqual($oop[constName], func, "should set function");
    });

    test("Adding global constants", function () {
        var constName = 'x' + Math.random(),
            constants = {};

        constants[constName] = true;

        strictEqual($oop.addGlobalConstants(constants), $oop, "should be chainable");
        equal($oop[constName], true, "should set constant value");

        throws(function () {
            $oop.addGlobalConstants(constants);
        }, "should raise exception on re-adding constant");
    });
}());
