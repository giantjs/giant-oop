/*global giant, giant */
(function () {
    "use strict";

    // custom assertion for giant classes
    giant.addTypes(/** @lends giant */{
        /**
         * Checks whether properties of `expr` are *all* functions.
         * @param {object} expr
         */
        isAllFunctions: function (expr) {
            var methodNames,
                i;

            if (!this.isObject(expr)) {
                return false;
            }

            methodNames = Object.keys(expr);
            for (i = 0; i < methodNames.length; i++) {
                if (!this.isFunctionOptional(expr[methodNames[i]])) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Verifies if `expr` is a Giant class.
         * @param {giant.Base} expr
         */
        isClass: function (expr) {
            return self.isPrototypeOf(expr);
        },

        /**
         * Verifies if `expr` is a Giant class or is not defined.
         * @param {giant.Base} expr
         */
        isClassOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   self.isPrototypeOf(expr);
        }
    });

    /**
     * Base class. Implements tools for building, instantiating and testing classes.
     * @class
     */
    giant.Base = {
        /**
         * Disposable method for adding further (public) methods.
         * Will be replaced by Properties.
         * @param {object} methods Object of methods.
         * @ignore
         */
        addMethods: function (methods) {
            giant.isAllFunctions(methods, "Some methods are not functions.");

            var methodNames = Object.keys(methods),
                i, methodName;
            for (i = 0; i < methodNames.length; i++) {
                methodName = methodNames[i];
                Object.defineProperty(this, methodName, {
                    value       : methods[methodName],
                    enumerable  : true,
                    writable    : false,
                    configurable: false
                });
            }

            return this;
        }
    };

    var self = giant.Base;

    self.addMethods(/** @lends giant.Base */{
        /**
         * Extends class. Extended classes may override base class methods and properties according to
         * regular OOP principles.
         * @example
         * var MyClass = giant.Base.extend();
         * @returns {giant.Base}
         */
        extend: function () {
            var result = Object.create(this);

            /**
             * Extending once more with no own properties
             * so that methods may be mocked on a static level.
             */
            if (giant.testing === true) {
                result = Object.create(result);
            }

            return result;
        },

        /**
         * Determines target object of method addition.
         * In testing mode, each class has two prototype levels and methods should go to the lower one
         * so they may be covered on the other. Do not use in production, only testing.
         * @returns {giant.Base}
         */
        getTarget: function () {
            return /** @type {giant.Base} */ giant.testing === true ?
                Object.getPrototypeOf(this) :
                this;
        },

        /**
         * Retrieves the base class of the current class.
         * @example
         * var MyClass = giant.Base.extend();
         * MyClass.getBase() === giant.Base; // true
         * @returns {giant.Base}
         */
        getBase: function () {
            return /** @type {giant.Base} */ giant.testing === true ?
                Object.getPrototypeOf(Object.getPrototypeOf(this)) :
                Object.getPrototypeOf(this);
        },

        /**
         * Tests whether the current class or instance is a descendant of base.
         * @example
         * var MyClass = giant.Base.extend();
         * MyClass.isA(giant.Base) // true
         * MyClass.isA(MyClass) // false
         * @param {giant.Base} base
         * @returns {boolean}
         */
        isA: function (base) {
            return base.isPrototypeOf(this);
        },

        /**
         * Tests whether the current class is base of the provided object.
         * @function
         * @example
         * var MyClass = giant.Base.extend();
         * MyClass.isA(giant.Base) // true
         * MyClass.isA(MyClass) // false
         * @returns {boolean}
         */
        isBaseOf: Object.prototype.isPrototypeOf,

        /**
         * Tests whether the current class or instance is the direct extension or instance
         * of the specified class.
         * @param {giant.Base} base
         * @example
         * var ClassA = giant.Base.extend(),
         *     ClassB = ClassA.extend();
         * ClassA.instanceOf(giant.Base) // true
         * ClassB.instanceOf(giant.Base) // false
         * ClassB.instanceOf(ClassA) // true
         * @returns {Boolean}
         */
        instanceOf: function (base) {
            return self.getBase.call(this) === base;
        }
    });
}());
