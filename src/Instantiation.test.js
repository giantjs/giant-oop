(function () {
    "use strict";

    module("Instantiation");

    test("Instance creation", function () {
        var MyClass = $oop.Base.extend(),
            instance;

        expect(3);

        MyClass.init = function (arg) {
            this.test = "bar";
            equal(arg, 'testArgument', "should call init of the class");
        };

        instance = MyClass.create('testArgument');

        ok(instance.isA(MyClass), "should return an instance of the class");
        equal(instance.test, "bar", "should return initialized instance");
    });

    test("Memoized instantiation", function () {
        var MyClass = $oop.Base.extend()
                .setInstanceMapper(function (name) {
                    return name;
                }),
            instance;

        deepEqual(MyClass.instanceRegistry, {},
            "should initialize instance registry as empty object");

        instance = MyClass.create('foo');

        deepEqual(MyClass.instanceRegistry, {
            foo: instance
        }, "should set instance in registry");

        strictEqual(MyClass.create('foo'), instance,
            "should return the same instance on subsequent instantiation");
    });

    test("Opting out of memoization", function () {
        var MyClass = $oop.Base.extend()
                .setInstanceMapper(function (name) {
                    return name !== 'bar' ? name : undefined;
                }),
            instance1 = MyClass.create('foo'),
            instance2 = MyClass.create('bar'),
            instance3 = MyClass.create('baz');

        deepEqual(MyClass.instanceRegistry, {
            foo: instance1,
            baz: instance3
        }, "should not register instance that returned undefined");
    });

    test("Surrogate instantiation", function () {
        expect(4);

        var ns = {};

        ns.Base = $oop.Base.extend()
            .addSurrogate(ns, 'Child1', function (test) {
                return test === 'foo';
            })
            .addSurrogate(ns, 'Child2', function (test) {
                return test === 'bar';
            });

        ns.Child1 = ns.Base.extend()
            .addMethods({
                init: function (test) {
                    equal(test, 'foo', "should call .init of the surrogate class");
                }
            });

        ns.Child2 = ns.Base.extend();

        ok(ns.Base.create('foo').isA(ns.Child1),
            "should return an instance of a suitable surrogate");
        ok(!ns.Base.create('blah').isA(ns.Child1),
            "should return base class instance when no suitable surrogate is found");
        ok(ns.Base.create('bar').isA(ns.Child2),
            "should return instance of other suitable surrogate for different arguments");
    });

    test("Instantiation with surrogates & memoization", function () {
        var ns = {};

        ns.Base = $oop.Base.extend()
            .setInstanceMapper(function (foo) {
                return foo;
            })
            .addSurrogate(ns, 'MemoizedChild', function (foo) {
                return foo === 'bar';
            })
            .addSurrogate(ns, 'NonMemoizedChild', function (foo) {
                return foo === 'baz';
            });

        ns.NonMemoizedChild = ns.Base.extend();

        ns.MemoizedChild = ns.Base.extend()
            .setInstanceMapper(function (foo) {
                return foo;
            });

        var base1 = ns.Base.create('foo'),
            base2 = ns.Base.create('bar'),
            base3 = ns.Base.create('baz'),
            child2 = ns.MemoizedChild.create('baz'),
            child3 = ns.NonMemoizedChild.create('yaz');

        deepEqual(ns.Base.instanceRegistry, {
            foo: base1,
            baz: base3,
            yaz: child3
        }, "should set instances of base class and non-memoized child class on base class' instance registry");

        deepEqual(ns.MemoizedChild.instanceRegistry, {
            bar: base2,
            baz: child2
        }, "should set instances of memoized child class on child class' instance registry");

        strictEqual(ns.MemoizedChild.create('bar'), base2,
            "should be irrelevant through which class we instantiate");
    });
}());
