(function () {
    "use strict";

    module("Base");

    test("Class extension", function () {
        var myClass = $oop.Base.extend.call(Object.prototype);

        ok(Object.getPrototypeOf(myClass) === Object.prototype, "Immediate prototype is base");
    });

    test("Extension while in test mode", function () {
        $oop.testing = true;

        var myClass = $oop.Base.extend.call(Object.prototype);

        ok(Object.getPrototypeOf(myClass) !== Object.prototype, "Immediate prototype not base");
        ok(Object.getPrototypeOf(Object.getPrototypeOf(myClass)) === Object.prototype, "Second prototype is base");

        $oop.testing = false;
    });

    test("Base", function () {
        var testing = $oop.testing,
            extended;

        $oop.testing = false;
        extended = $oop.Base.extend();
        equal($oop.Base.getBase.call(extended), $oop.Base, "Getting base class in live mode");

        $oop.testing = true;
        extended = $oop.Base.extend();
        equal($oop.Base.getBase.call(extended), $oop.Base, "Getting base class in testing mode");

        $oop.testing = testing;
    });

    test("Custom assertions", function () {
        var v = $assertion.validators,
            extended = $oop.Base.extend();

        equal(v.isClass(extended), true, "Giant class passes assertion");
        equal(v.isClass({}), false, "Ordinary object fails assertion");
        equal(v.isClassOptional(extended), true, "Giant class passes assertion (optional)");
        equal(v.isClassOptional(), true, "Undefined passes assertion (optional)");
        equal(v.isClassOptional({}), false, "Ordinary object fails assertion (optional)");
    });

    test("Extension", function () {
        var hasPropertyAttributes = $oop.Feature.hasPropertyAttributes(),
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

        derived = $oop.Base.extend()
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
        equal(derived.getBase(), $oop.Base, "Derived extends from $oop.Base");
        equal($oop.Base.getBase(), Object.prototype, "$oop.Base extends from Object.prototype");
    });

    test("Base validation", function () {
        ok($oop.Base.isA.call({}, Object.prototype), "{} is an Object.prototype");
        ok($oop.Base.isA.call([], Array.prototype), "[] is an Array.prototype");

        var myBase = $oop.Base.extend()
                .addMethods({init: function () {}}),
            myChild = myBase.extend()
                .addMethods({init: function () {}});

        ok($oop.Base.instanceOf.call(myChild, myBase), "Direct descendant");
        ok($oop.Base.instanceOf.call(myBase, $oop.Base), "Direct descendant");
        ok(!$oop.Base.instanceOf.call(myChild, $oop.Base), "Not direct descendant");

        ok($oop.Base.isA.call(myChild, $oop.Base), "Not direct descendant");

        ok($oop.Base.isBaseOf(myBase), "Giant base class is base to all others");
        ok(myBase.isBaseOf(myChild), "Descendant");
        ok(!myChild.isBaseOf(myBase), "Invalid relation");
        ok(!myChild.isBaseOf(myChild), "Self is not base");
    });
}());
