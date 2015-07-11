/*global giant, giant, module, test, ok, equal, notEqual, strictEqual, deepEqual, raises, expect, mock, unMock */
(function () {
    "use strict";

    module("Base");

    test("Class extension", function () {
        var myClass = giant.Base.extend.call(Object.prototype);

        ok(Object.getPrototypeOf(myClass) === Object.prototype, "Immediate prototype is base");
    });

    test("Extension while in test mode", function () {
        giant.testing = true;

        var myClass = giant.Base.extend.call(Object.prototype);

        ok(Object.getPrototypeOf(myClass) !== Object.prototype, "Immediate prototype not base");
        ok(Object.getPrototypeOf(Object.getPrototypeOf(myClass)) === Object.prototype, "Second prototype is base");

        giant.testing = false;
    });

    test("Base", function () {
        var testing = giant.testing,
            extended;

        giant.testing = false;
        extended = giant.Base.extend();
        equal(giant.Base.getBase.call(extended), giant.Base, "Getting base class in live mode");

        giant.testing = true;
        extended = giant.Base.extend();
        equal(giant.Base.getBase.call(extended), giant.Base, "Getting base class in testing mode");

        giant.testing = testing;
    });

    test("Custom assertions", function () {
        var v = giant.validators,
            extended = giant.Base.extend();

        equal(v.isClass(extended), true, "Giant class passes assertion");
        equal(v.isClass({}), false, "Ordinary object fails assertion");
        equal(v.isClassOptional(extended), true, "Giant class passes assertion (optional)");
        equal(v.isClassOptional(), true, "Undefined passes assertion (optional)");
        equal(v.isClassOptional({}), false, "Ordinary object fails assertion (optional)");
    });

    test("Extension", function () {
        var hasPropertyAttributes = giant.Feature.hasPropertyAttributes(),
            derived, keys,
            instance;

        function testMethod() {}

        /**
         * Initializer for derived class
         */
        function init() {
            /*jshint validthis:true */
            this
                .addPrivate({
                    _woo: "hoo"
                })
                .addPublic({
                    holy: "moly"
                })
                .addConstants({
                    pi: 3.14
                });
        }

        derived = giant.Base.extend()
            .addPrivate({
                _hello: "world"
            })
            .addPublic({
                yo: "momma"
            })
            .addMethods({
                foo : testMethod,
                init: init
            });

        keys = Object.keys(derived).sort();
        deepEqual(
            keys,
            hasPropertyAttributes ?
                ['foo', 'init', 'yo'] :
                ['_hello', 'foo', 'init', 'yo'],
            "Public class members"
        );

        equal(derived._hello, "world", "Private class member");

        instance = derived.create();
        keys = Object.keys(instance).sort();

        deepEqual(
            keys,
            hasPropertyAttributes ?
                ['holy', 'pi'] :
                ['_woo', 'holy', 'pi'],
            "Public instance members"
        );

        equal(instance._woo, "hoo", "Private instance member");

        equal(instance.getBase(), derived, "Instance extends from derived");
        equal(derived.getBase(), giant.Base, "Derived extends from giant.Base");
        equal(giant.Base.getBase(), Object.prototype, "giant.Base extends from Object.prototype");
    });

    test("Base validation", function () {
        ok(giant.Base.isA.call({}, Object.prototype), "{} is an Object.prototype");
        ok(giant.Base.isA.call([], Array.prototype), "[] is an Array.prototype");

        var myBase = giant.Base.extend()
                .addMethods({init: function () {}}),
            myChild = myBase.extend()
                .addMethods({init: function () {}});

        ok(giant.Base.instanceOf.call(myChild, myBase), "Direct descendant");
        ok(giant.Base.instanceOf.call(myBase, giant.Base), "Direct descendant");
        ok(!giant.Base.instanceOf.call(myChild, giant.Base), "Not direct descendant");

        ok(giant.Base.isA.call(myChild, giant.Base), "Not direct descendant");

        ok(giant.Base.isBaseOf(myBase), "Giant base class is base to all others");
        ok(myBase.isBaseOf(myChild), "Descendant");
        ok(!myChild.isBaseOf(myBase), "Invalid relation");
        ok(!myChild.isBaseOf(myChild), "Self is not base");
    });
}());
