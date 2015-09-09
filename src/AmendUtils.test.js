/*global giant, module, test, expect, ok, equal, notEqual, strictEqual, deepEqual, raises */
var ns = {}; // global namespace

(function () {
    "use strict";

    module("AmendUtils");

    test("Amendments getter", function () {
        var propertyDescriptor = {
            get: function () {
            },

            set: function () {
            },

            enumerable  : true,
            configurable: true
        };

        deepEqual(giant.AmendUtils.getAmendments(propertyDescriptor), [],
            "should return empty array for no amendments");

        propertyDescriptor.get.amendments = ['foo', 'bar'];

        deepEqual(giant.AmendUtils.getAmendments(propertyDescriptor), ['foo', 'bar'],
            "should return amendments array from descriptor");
    });

    test("Amendments setter", function () {
        var propertyDescriptor = {
            get: function () {
            },

            set: function () {
            },

            enumerable  : true,
            configurable: true
        };

        giant.AmendUtils.setAmendments(propertyDescriptor, ['foo', 'bar']);

        deepEqual(propertyDescriptor.get.amendments, ['foo', 'bar'],
            "should set amendments array on descriptor");
    });

    test("Amendment addition", function () {
        var propertyDescriptor = {
                get: function () {
                },

                set: function () {
                },

                enumerable  : true,
                configurable: true
            },
            modifier = function () {
            },
            modifierArguments = [];

        giant.AmendUtils.addAmendment(propertyDescriptor, modifier, modifierArguments);

        deepEqual(propertyDescriptor.get.amendments, [
            {
                modifier: modifier,
                args    : modifierArguments
            }
        ],
            "should add amendment to amendments");
    });

    test("Applying amendments", function () {
        expect(1);

        var propertyDescriptor = {
                get: function () {
                },

                set: function () {
                },

                enumerable  : true,
                configurable: true
            },
            amendments = [
                {
                    modifier: function (foo) {
                        equal(foo, 'foo', "should call amendment with passed arguments");
                    },
                    args    : ['foo']
                }
            ];

        giant.AmendUtils.applyAmendments(propertyDescriptor, amendments);
    });
}());
