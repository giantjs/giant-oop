/*global giant, module, test, ok, equal, deepEqual, expect, raises */
var globalNs = {};

(function () {
    "use strict";

    module("Surrogate", {
        setup: function () {
            giant.testing = true;
        },

        teardown: function () {
            giant.testing = false;
        }
    });

    test("Finding surrogate", function () {
        var ns = {};

        ns.base = giant.Base.extend()
            .addSurrogate(ns, 'child', function (test) {
                ok("should invoke surrogate filter");
                if (test === 'test') {
                    return true;
                }
            });

        ns.child = ns.base.extend();

        equal(giant.Surrogate.getSurrogate.call(ns.base, 'test'), ns.child,
            "should return subclass instance when arguments fit condition");
        equal(giant.Surrogate.getSurrogate.call(ns.base, 'blah'), ns.base,
            "should return instance of original class when arguments don't fit conditions");
    });

    test("Surrogate preparation", function () {
        expect(2);

        var base = giant.Base.extend()
                .addMethods({
                    init: function () {
                        equal(arguments.length, 1, "should pass original ctr arguments to init");
                    }
                }),
            child = base.extend(),
            ns = {
                base : base,
                child: child
            };

        base
            .prepareSurrogates(function (originalArg) {
                return [originalArg, 'foo'];
            })
            .addSurrogate(ns, 'child', function (originalArg, extraArg) {
                deepEqual(Array.prototype.slice.call(arguments), ['bar', 'foo'],
                    "should pass arguments returned by preparation handler to surrogate filter");
                return originalArg === 'bar';
            });

        base.create('bar');
    });

    test("Surrogate addition", function () {
        var filter = function () {
            },
            base = giant.Base.extend()
                .addMethods({
                    init: function () {
                    }
                }),
            child = base.extend()
                .addMethods({
                    init: function () {
                    }
                }),
            ns = {
                base : base,
                child: child
            };

        strictEqual(base.addSurrogate(ns, 'child', filter), base, "should be chainable");

        deepEqual(base.surrogateInfo.descriptors, [
            {
                namespace: ns,
                className: 'child',
                filter   : filter
            }
        ], "should set descriptor object for surrogate");
    });

    test("Adding surrogate to memoized class", function () {
        expect(1);

        var base = giant.Base.extend()
                .setInstanceMapper(function () {
                    return 'singleton';
                })
                .addMethods({
                    init: function () {
                    }
                }),
            child = base.extend()
                .addMethods({
                    init: function () {
                    }
                }),
            ns = {
                base : base,
                child: child
            };

        base.addMocks({
            clearInstanceRegistry: function () {
                ok(true, "should clear instance registry");
            }
        });

        base.addSurrogate(ns, 'child', function () {});
    });
}());