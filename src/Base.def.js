(function () {
    "use strict";

    $assertion.addTypes(/** @lends $oop */{
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
         * Checks whether properties of `expr` are *all* non functions.
         * @param {object} expr
         */
        hasNoFunctions: function (expr) {
            var methodNames,
                i;

            if (!this.isObject(expr)) {
                return true;
            }

            methodNames = Object.keys(expr);
            for (i = 0; i < methodNames.length; i++) {
                if (this.isFunctionOptional(expr[methodNames[i]])) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Verifies if `expr` is a Giant class.
         * @param {$oop.Base} expr
         */
        isClass: function (expr) {
            return self.isPrototypeOf(expr);
        },

        /**
         * Verifies if `expr` is a Giant class or is not defined.
         * @param {$oop.Base} expr
         */
        isClassOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   self.isPrototypeOf(expr);
        }
    });

    /**
     * @name $oop.Base.extend
     * @function
     * @returns {$oop.Base}
     */

    /**
     * Base class. Implements tools for building, instantiating and testing classes.
     * @class
     */
    $oop.Base = {
        /**
         * Disposable method for adding further (public) methods.
         * Will be replaced by Properties.
         * @param {object} methods Object of methods.
         * @ignore
         */
        addMethods: function (methods) {
            $assertion.isAllFunctions(methods, "Some methods are not functions.");

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

    var self = $oop.Base;

    self.addMethods(/** @lends $oop.Base# */{
        /**
         * Extends class. Extended classes may override base class methods and properties according to
         * regular OOP principles.
         * @example
         * var MyClass = $oop.Base.extend();
         * @returns {$oop.Base}
         */
        extend: function () {
            var result = Object.create(this);

            /**
             * Extending once more with no own properties
             * so that methods may be mocked on a static level.
             */
            if ($oop.testing === true) {
                result = Object.create(result);
            }

            return result;
        },

        /**
         * Determines target object of method addition.
         * In testing mode, each class has two prototype levels and methods should go to the lower one
         * so they may be covered on the other. Do not use in production, only testing.
         * @returns {$oop.Base}
         */
        getTarget: function () {
            return /** @type {$oop.Base} */ $oop.testing === true ?
                Object.getPrototypeOf(this) :
                this;
        },

        /**
         * Retrieves the base class of the current class.
         * @example
         * var MyClass = $oop.Base.extend();
         * MyClass.getBase() === $oop.Base; // true
         * @returns {$oop.Base}
         */
        getBase: function () {
            return /** @type {$oop.Base} */ $oop.testing === true ?
                Object.getPrototypeOf(Object.getPrototypeOf(this)) :
                Object.getPrototypeOf(this);
        },

        /**
         * Tests whether the current class or instance is a descendant of base.
         * @example
         * var MyClass = $oop.Base.extend();
         * MyClass.isA($oop.Base) // true
         * MyClass.isA(MyClass) // false
         * @param {$oop.Base} base
         * @returns {boolean}
         */
        isA: function (base) {
            return base.isPrototypeOf(this);
        },

        /**
         * Tests whether the current class is base of the provided object.
         * @method
         * @returns {boolean}
         * @example
         * var MyClass = $oop.Base.extend();
         * MyClass.isA($oop.Base) // true
         * MyClass.isA(MyClass) // false
         */
        isBaseOf: Object.prototype.isPrototypeOf,

        /**
         * Tests whether the current class or instance is the direct extension or instance
         * of the specified class.
         * @param {$oop.Base} base
         * @example
         * var ClassA = $oop.Base.extend(),
         *     ClassB = ClassA.extend();
         * ClassA.instanceOf($oop.Base) // true
         * ClassB.instanceOf($oop.Base) // false
         * ClassB.instanceOf(ClassA) // true
         * @returns {Boolean}
         */
        instanceOf: function (base) {
            return self.getBase.call(this) === base;
        }
    });
}());
