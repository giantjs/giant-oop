/*global troop, module, test, ok, equal, strictEqual, deepEqual, expect, raises */
(function () {
    "use strict";

    module("Built-in Utils");

    test("Adding extension methods", function () {
        var builtIn = {};

        raises(function () {
            troop.extendBuiltIn(builtIn, {
                toFoo: 'foo'
            });
        }, "should raise exception for non-function extensions");

        raises(function () {
            troop.extendBuiltIn(builtIn, {
                foo: function () {}
            });
        }, "should raise exception for non-conversion extensions");

        function toFoo() {
            return 'foo' + this;
        }

        troop.extendBuiltIn(builtIn, {
            toFoo: toFoo
        });

        deepEqual(Object.getOwnPropertyDescriptor(builtIn, 'toFoo'), {
            writable    : false,
            configurable: false,
            enumerable  : false,
            value       : toFoo
        }, "should set the property");

        equal(builtIn.toFoo(), 'foo[object Object]', "should set up conversion method");
    });
}());
