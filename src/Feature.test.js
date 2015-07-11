/*global giant, module, test, ok, equal, deepEqual, expect */
(function () {
    "use strict";

    module("Feature detection");

    test("Flags", function () {
        ok(giant.hasOwnProperty('testing'), "Testing flag exists");
        ok(giant.hasOwnProperty('writable'), "Writable flag exists");
    });
}());
