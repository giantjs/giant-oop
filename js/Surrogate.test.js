/**
 * Surrogate unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect, raises */
var globalNs = {};

(function () {
    "use strict";

    module("Surrogate");

    test("Finding surrogate", function () {
        var ns = {};

        ns.base = troop.Base.extend()
            .addSurrogate(ns, 'child', function (test) {
                ok("should invoke surrogate handler");
                if (test === 'test') {
                    return true;
                }
            });

        ns.child = ns.base.extend();

        equal(troop.Surrogate.getSurrogate.call(ns.base, 'test'), ns.child,
            "should return subclass instance when arguments fit condition");
        equal(troop.Surrogate.getSurrogate.call(ns.base, 'blah'), ns.base,
            "should return instance of original class when arguments don't fit conditions");
    });

    test("Surrogate preparation", function () {
        expect(2);

        var base = troop.Base.extend()
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
                    "should pass arguments returned by preparation handler to surrogate handler");
                return originalArg === 'bar';
            });

        base.create('bar');
    });

    test("Surrogate addition", function () {
        var filter = function () {
            },
            base = troop.Base.extend()
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

        globalNs.child = child;

        base.addSurrogate(ns, 'child', filter);

        deepEqual(base.surrogateInfo.descriptors, [
            {
                namespace: ns,
                className: 'child',
                filter   : filter
            }
        ], "should set descriptor object for surrogate");
    });
}());