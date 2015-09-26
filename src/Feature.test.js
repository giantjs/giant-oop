(function () {
    "use strict";

    module("Feature detection");

    test("Flags", function () {
        ok($oop.hasOwnProperty('testing'), "Testing flag exists");
        ok($oop.hasOwnProperty('writable'), "Writable flag exists");
    });
}());
