var globalNs = {};

(function () {
    "use strict";

    module("Surrogate", {
        setup: function () {
            $oop.testing = true;
        },

        teardown: function () {
            $oop.testing = false;
        }
    });

    test("Finding surrogate", function () {
        var ns = {};

        ns.base = $oop.Base.extend()
            .addSurrogate(ns, 'child', function (test) {
                ok("should invoke surrogate filter");
                if (test === 'test') {
                    return true;
                }
            });

        ns.child = ns.base.extend();

        equal($oop.Surrogate.getSurrogate.call(ns.base, 'test'), ns.child,
            "should return subclass instance when arguments fit condition");
        equal($oop.Surrogate.getSurrogate.call(ns.base, 'blah'), ns.base,
            "should return instance of original class when arguments don't fit conditions");
    });

    test("Surrogate preparation", function () {
        expect(2);

        var base = $oop.Base.extend()
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
            base = $oop.Base.extend()
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
                filter   : filter,
                priority : 0
            }
        ], "should set descriptor object for surrogate");
    });

    test("Surrogate addition with priority", function () {
        var filter1 = function () {
            },
            filter2 = function () {
            },
            base = $oop.Base.extend()
                .addMethods({
                    init: function () {
                    }
                }),
            child1 = base.extend()
                .addMethods({
                    init: function () {
                    }
                }),
            child2 = base.extend()
                .addMethods({
                    init: function () {
                    }
                }),
            ns = {
                base : base,
                child: child1
            };

        base
            .addSurrogate(ns, 'child1', filter1, 1)
            .addSurrogate(ns, 'child2', filter2, 10);

        deepEqual(base.surrogateInfo.descriptors, [
            {
                namespace: ns,
                className: 'child2',
                filter   : filter2,
                priority : 10
            },
            {
                namespace: ns,
                className: 'child1',
                filter   : filter1,
                priority : 1
            }
        ], "should set descriptors in correct order");
    });

    test("Adding surrogate to memoized class", function () {
        expect(1);

        var base = $oop.Base.extend()
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

        base.addSurrogate(ns, 'child', function () {
        });
    });
}());