/*global giant */
(function () {
    "use strict";

    module("GlobalUtils");

    test("Adding constants", function () {
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
