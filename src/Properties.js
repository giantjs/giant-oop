/*global giant, console */
(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        validators = giant.validators;

    giant.addTypes(/** @lends giant */{
        /**
         * Checks whether host object has propertyName defined as its
         * own property.
         * @param {string} propertyName
         * @param {object} host
         */
        isPropertyNameAvailable: function (propertyName, host) {
            return !hOP.call(host, propertyName);
        },

        /**
         * Checks property names against prefix.
         * @param {object} expr Host object.
         * @param {string} prefix Prefix.
         */
        isAllPrefixed: function (expr, prefix) {
            var propertyNames,
                i;

            if (!this.isString(prefix) || !this.isPlainObject(expr)) {
                return false;
            }

            propertyNames = Object.keys(expr);
            for (i = 0; i < propertyNames.length; i++) {
                if (propertyNames[i].substr(0, prefix.length) !== prefix) {
                    // prefix doesn't match property name
                    return false;
                }
            }

            return true;
        },

        /**
         * Tells whether an object holds a getter / setter pair.
         * @param {object} expr Host object.
         */
        isAccessor: function (expr) {
            var accessorMethods = {
                'get'    : true,
                'set'    : true,
                'get,set': true,
                'set,get': true
            };

            return this.isPlainObject(expr) &&
                   this.isAllFunctions(expr) &&
                   Object.getOwnPropertyNames(expr).join(',') in accessorMethods;
        }
    });

    /**
     * Allows properties to be added to arbitrary objects as if they were Giant classes.
     * The Giant base class uses these methods internally. They are exposed however due to their usefulness in testing.
     * @class
     */
    giant.Properties = {
        /**
         * Retrieves the object from the host's prototype chain that owns the specified property.
         * @param {string} propertyName
         * @param {object} host
         * @returns {object|undefined}
         */
        getOwnerOf: function (host, propertyName) {
            var owner = host;

            while (owner !== Object.prototype) {
                if (hOP.call(owner, propertyName)) {
                    return owner;
                } else {
                    owner = Object.getPrototypeOf(owner);
                }
            }
        },

        /**
         * Collects all property names (including non-enumerable ones) from the entire prototype chain.
         * Always excludes the properties of Object.prototype.
         * @param {object} host
         * @param {object} [base=Object.prototype]
         */
        getPropertyNames: function (host, base) {
            base = base || Object.prototype;

            var propertyNameLookup = {},
                currentLevel = host,
                propertyNames,
                i;

            while (currentLevel !== base) {
                propertyNames = Object.getOwnPropertyNames(currentLevel);
                for (i = 0; i < propertyNames.length; i++) {
                    propertyNameLookup[propertyNames[i]] = true;
                }
                currentLevel = Object.getPrototypeOf(currentLevel);
            }

            // flipping lookup
            return Object.keys(propertyNameLookup);
        },

        /**
         * Retrieves the property descriptor of the specified property regardless of its position
         * on the prototype chain.
         * @param {object} host
         * @param {string} propertyName
         * @return {object|undefined}
         * @see Object.getOwnPropertyDescriptor
         */
        getPropertyDescriptor: function (host, propertyName) {
            var owner = this.getOwnerOf(host, propertyName);

            if (owner) {
                return Object.getOwnPropertyDescriptor(owner, propertyName);
            }
        },

        /**
         * Adds single value property to the context.
         * @this {giant.Base}
         * @param {string} propertyName Property name.
         * @param value {*} Property value to be assigned.
         * @param {boolean} [isWritable]
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         */
        addProperty: function (propertyName, value, isWritable, isEnumerable, isConfigurable) {
            giant
                .isString(propertyName, "Invalid property name")
                .isBooleanOptional(isWritable)
                .isBooleanOptional(isEnumerable)
                .isBooleanOptional(isConfigurable);

            Object.defineProperty(this, propertyName, {
                value       : value,
                writable    : isWritable || giant.messy,
                enumerable  : isEnumerable,
                configurable: isConfigurable
            });
        },

        /**
         * Adds single accessor property to the context.
         * @this {giant.Base}
         * @param {string} propertyName Property name.
         * @param {function} [getter] Property getter.
         * @param {function} [setter] Property setter.
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         */
        addAccessor: function (propertyName, getter, setter, isEnumerable, isConfigurable) {
            giant
                .isString(propertyName, "Invalid property name")
                .isFunctionOptional(getter)
                .isFunctionOptional(setter)
                .isBooleanOptional(isEnumerable)
                .isBooleanOptional(isConfigurable);

            Object.defineProperty(this, propertyName, {
                get         : getter,
                set         : setter,
                enumerable  : isEnumerable,
                configurable: isConfigurable
            });
        },

        /**
         * Adds a block of properties to the context having the specified attributes.
         * @this {giant.Base}
         * @param {object|function} properties Property object or its generator function.
         * @param {boolean} [isWritable]
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         * @returns {giant.Base}
         */
        addProperties: function (properties, isWritable, isEnumerable, isConfigurable) {
            var propertyNames = Object.keys(properties),
                i, propertyName, property;

            for (i = 0; i < propertyNames.length; i++) {
                // making sure property name is available
                propertyName = propertyNames[i];
                giant.isPropertyNameAvailable(propertyName, this, "Direct property conflict");

                // adding accessor / property
                property = properties[propertyName];
                if (validators.isAccessor(property)) {
                    self.addAccessor.call(this,
                        propertyName,
                        property.get,
                        property.set,
                        isEnumerable,
                        isConfigurable
                    );
                } else {
                    self.addProperty.call(this,
                        propertyName,
                        property,
                        isWritable,
                        isEnumerable,
                        isConfigurable
                    );
                }
            }

            return this;
        }
    };

    var self = giant.Properties;

    giant.Base.addMethods(/** @lends giant.Base# */{
        /**
         * Adds a block of public read-only methods to the class it's called on.
         * When giant.testing is on, methods will be placed on the class differently than other properties,
         * therefore it is important to use .addMethods and .addPrivateMethods for method addition.
         * @param {object} methods Name - value pairs of methods to apply. Values must be functions,
         * or objects implementing a pair of get and set functions.
         * @example
         * var myClass = giant.extend()
         *    .addMethods({
         *        foo: function () {alert("Foo");},
         *        bar: {get: function () {return "Bar";}
         *    });
         * @returns {giant.Base}
         */
        addMethods: function (methods) {
            giant.isAllFunctions(methods);

            self.addProperties.call(giant.Base.getTarget.call(this), methods, false, true, false);

            return this;
        },

        /**
         * Adds a block of private (non-enumerable) read-only methods to the class it's called on.
         * Method names must match the private prefix rule set by `giant.privatePrefix`.
         * When giant.testing is on, methods will be placed on the class differently than other properties,
         * therefore it is important to use .addMethods and .addPrivateMethods for method addition.
         * @param {object} methods Name - value pairs of methods to apply. Values must be functions,
         * or objects implementing a pair of get and set functions.
         * @example
         * var myClass = giant.extend()
         *    .addMethods({
         *        _foo: function () {alert("Foo");},
         *        _bar: {get: function () {return "Bar";}
         *    });
         * @returns {giant.Base}
         */
        addPrivateMethods: function (methods) {
            giant
                .isAllFunctions(methods, "Some private methods are not functions.")
                .isAllPrefixed(methods, giant.privatePrefix, "Some private method names do not match the required prefix.");

            self.addProperties.call(giant.Base.getTarget.call(this), methods);

            return this;
        },

        /**
         * Adds a trait to the current class.
         * A trait may be as simple as a plain object holding properties and methods to be copied over to the
         * current class. More often however, a trait is a Giant class, through which, Giant realizes a form of
         * multiple inheritance. There will still be just one prototype from which the current class stems, but
         * methods delegated by the trait class will be used the same way as if they were implemented on the current
         * class.
         * Trait addition preserves ES5 attributes of copied properties, but skips property named `init`.
         * Each trait must be initialized manually.
         * @param {object|giant.Base} trait Trait object
         * @example
         * MyTrait = giant.Base.extend()
         *    .addMethods({
         *        init: function () { alert("trait init"); }
         *        foo: function () { alert("hello"); }
         *    });
         * MyClass = giant.Base.extend()
         *    .addTrait(MyTrait)
         *    .addMethods({ init: function () { MyTrait.init.call(this); } });
         * myInstance = MyClass.create(); // alerts "trait init"
         * myInstance.foo(); // alerts "hello"
         * @returns {giant.Base}
         */
        addTrait: function (trait) {
            giant.isObject(trait, "Invalid trait descriptor");

            // obtaining all property names (including non-enumerable)
            // for giant classes, only those above the base class will be considered
            var hostTarget = giant.Base.getTarget.call(this),
                propertyNames = giant.Properties.getPropertyNames(
                    trait,
                    giant.Base.isBaseOf(trait) ?
                    giant.Base :
                    Object.prototype
                ),
                i, propertyName, property;

            for (i = 0; i < propertyNames.length; i++) {
                propertyName = propertyNames[i];

                if (propertyName === 'init') {
                    // skipping 'init'
                    continue;
                }

                // trait properties must not collide w/ host's
                giant.isPropertyNameAvailable(propertyName, this, "Direct property conflict");

                // copying property over w/ original attributes
                property = trait[propertyName];
                Object.defineProperty(
                    typeof property === 'function' ?
                    hostTarget :
                    this,
                    propertyName,
                    giant.Properties.getPropertyDescriptor(trait, propertyName)
                );
            }

            return this;
        },

        /**
         * Adds trait to current class then extends it, allowing subsequently added methods to override
         * the trait's methods.
         * @param {object|giant.Base} trait
         * @returns {giant.Base}
         * @see giant.Base.addTrait
         */
        addTraitAndExtend: function (trait) {
            return this
                .addTrait(trait)
                .extend();
        },

        /**
         * Adds a block of public (enumerable) writable properties to the current class or instance.
         * @param {object} properties Name-value pairs of properties.
         * @returns {giant.Base}
         */
        addPublic: function (properties) {
            self.addProperties.call(this, properties, true, true, false);
            return this;
        },

        /**
         * Adds a block of private (non-enumerable) writable properties to the current class or instance.
         * Property names must match the private prefix rule set by `giant.privatePrefix`.
         * @param {object} properties Name-value pairs of properties.
         * @returns {giant.base}
         */
        addPrivate: function (properties) {
            giant.isAllPrefixed(properties, giant.privatePrefix, "Some private property names do not match the required prefix.");

            self.addProperties.call(this, properties, true, false, false);

            return this;
        },

        /**
         * Adds a block of public (enumerable) constant (read-only) properties to the current class or instance.
         * @param {object} properties Name-value pairs of constant properties
         * @returns {giant.Base}
         */
        addConstants: function (properties) {
            self.addProperties.call(this, properties, false, true, false);
            return this;
        },

        /**
         * Adds a block of private (non-enumerable) constant (read-only) properties to the current class or instance.
         * Property names must match the private prefix rule set by `giant.privatePrefix`.
         * @param {object} properties Name-value pairs of private constant properties.
         * @returns {giant.Base}
         */
        addPrivateConstants: function (properties) {
            giant.isAllPrefixed(properties, giant.privatePrefix, "Some private constant names do not match the required prefix.");

            self.addProperties.call(this, properties);

            return this;
        },

        /**
         * Elevates method from class level to instance level. (Or from base class to current class.)
         * Ties context to the object it was elevated to, so methods may be safely passed as event handlers.
         * @param {string} methodName Name of method to elevate.
         * @example
         * ClassA = giant.Base.extend()
         *    .addMethods({
         *        init: function () {},
         *        foo: function () { alert(this.bar); }
         *    });
         * ClassB = ClassA.extend()
         *     .addMethods({
         *         init: function () {
         *             this.bar = "hello";
         *             this.elevateMethod('foo');
         *         }
         *     });
         * foo = ClassB.create().foo; // should lose context
         * foo(); // alerts "hello", for context was preserved
         * @returns {giant.Base}
         */
        elevateMethod: function (methodName) {
            giant.isString(methodName, "Invalid method name");

            var base = this.getBase(), // class or base class
                baseMethod = base[methodName],
                elevatedMethod;

            giant.isFunction(baseMethod, "Attempted to elevate non-method.", methodName);

            elevatedMethod = {};
            elevatedMethod[methodName] = baseMethod.bind(this);
            giant.Base.addMethods.call(this, elevatedMethod);

            return this;
        },

        /**
         * Elevates multiple methods. Method names are expected to be passed as individual arguments.
         * (In no particular order.)
         * @returns {giant.Base}
         * @see giant.Base#elevateMethod
         */
        elevateMethods: function () {
            var i, methodName;
            for (i = 0; i < arguments.length; i++) {
                methodName = arguments[i];
                this.elevateMethod(methodName);
            }
            return this;
        },

        /**
         * Adds a block of public (enumerable) mock methods (read-only, but removable) to the current instance or class.
         * @param {object} methods Name-value pairs of methods. Values must be functions or getter-setter objects.
         * @example
         * giant.testing = true;
         * MyClass = giant.Base.extend()
         *      .addMethods({
         *          init: function () {},
         *          foo: function () {}
         *      });
         * myInstance = MyClass.create();
         * MyClass.addMocks({
         *     foo: function () {return 'FOO';}
         * });
         * myInstance.foo() // returns 'FOO'
         * @see giant.Base#addMethods
         * @returns {giant.Base}
         */
        addMocks: function (methods) {
            giant
                .assert(giant.testing, "Giant is not in testing mode.")
                .isAllFunctions(methods, "Some mock methods are not functions.");

            self.addProperties.call(this, methods, false, true, true);

            return this;
        },

        /**
         * Removes all mock methods from the current class or instance.
         * @returns {giant.Base}
         */
        removeMocks: function () {
            var propertyNames = Object.keys(this),
                i, propertyName, property;

            for (i = 0; i < propertyNames.length; i++) {
                propertyName = propertyNames[i];
                property = this[propertyName];
                if (typeof property === 'function' && !(property instanceof RegExp)) {
                    /**
                     * All enumerable function properties are considered mocks
                     * and will be removed (unless non-configurable).
                     * RegExp check: in older browsers (eg. Safari 4.0.5) typeof /regexp/
                     * evaluates to 'function' and should be excluded.
                     */
                    delete this[propertyName];
                }
            }

            return this;
        }
    });

    giant.Base.addPublic.call(giant, /** @lends giant */{
        /**
         * Prefix applied to names of private properties and methods.
         * @type {string}
         */
        privatePrefix: '_',

        /**
         * When true, all properties are writable, so they can be
         * modified through assignment.
         * @type {boolean}
         */
        messy: false
    });
}());
