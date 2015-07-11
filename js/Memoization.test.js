/*global giant, module, test, ok, equal, strictEqual, deepEqual, expect, raises */
(function () {
    "use strict";

    module("Memoization");

    test("Instance mapper", function () {
        function keyMapper(name) {
            return name;
        }

        var MyClass = giant.Base.extend();

        raises(function () {
            MyClass.setInstanceMapper('foo');
        }, "Invalid key mapper");

        MyClass.setInstanceMapper(keyMapper);

        strictEqual(MyClass.instanceMapper, keyMapper, "Key mapper set");

        ok(MyClass.isMemoized(), "MyClass is memoized");

        raises(function () {
            MyClass.setInstanceMapper(keyMapper);
        }, "Attempted to add another key mapper");

        var ExtendedClass = MyClass.extend();

        ok(ExtendedClass.isMemoized(), "ExtendedClass is also memoized");

        ok(!giant.Base.isMemoized(), "Base class is not memoized");
    });

    test("Memoizing instance", function () {
        var MyClass = giant.Base.extend()
                .setInstanceMapper(function keyMapper(name) {
                    return name;
                }),
            instance;

        deepEqual(
            MyClass.instanceRegistry,
            {},
            "Instance registry is initially empty"
        );

        // fake instance
        instance = {};

        giant.Memoization.addInstance.call(MyClass, "foo", instance);

        deepEqual(
            MyClass.instanceRegistry,
            {
                foo: instance
            },
            "Instance added to registry"
        );
    });

    test("Fetching memoized instance", function () {
        var MyClass = giant.Base.extend()
                .setInstanceMapper(function keyMapper(name) {
                    return name;
                }),
            instance = {};

        giant.Memoization.addInstance.call(MyClass, 'foo', instance);

        strictEqual(giant.Memoization.getInstance.call(MyClass, 'foo'), instance, "Instance fetched from registry");
    });

    test("Clearing instance registry", function () {
        var MyClass = giant.Base.extend()
                .setInstanceMapper(function keyMapper(name) {
                    return name;
                }),
            ChildClass = MyClass.extend(),
            instance = {};

        giant.Memoization.addInstance.call(MyClass, 'foo', instance);

        deepEqual(
            MyClass.instanceRegistry,
            {foo: instance},
            "Registry before clearing"
        );

        deepEqual(
            ChildClass.instanceRegistry,
            {foo: instance},
            "Registry before clearing (as seen from child class)"
        );

        raises(function () {
            ChildClass.clearInstanceRegistry();
        }, "Can't clear instances from derived class");

        MyClass.clearInstanceRegistry();

        deepEqual(
            MyClass.instanceRegistry,
            {},
            "Registry after clearing"
        );
    });
}());