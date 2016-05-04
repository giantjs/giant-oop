(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        validators = $assertion.validators;

    $assertion.addTypes(/** @lends $oop */{
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
         * Checks property names against prefix ensuring that all match.
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
         * Checks property names against prefix ensuring that none match.
         * @param {object} expr Host object.
         * @param {string} prefix Prefix.
         */
        hasNonePrefixed: function (expr, prefix) {
            var propertyNames,
                i;

            if (!this.isString(prefix) || !this.isPlainObject(expr)) {
                return true;
            }

            propertyNames = Object.keys(expr);
            for (i = 0; i < propertyNames.length; i++) {
                if (propertyNames[i].substr(0, prefix.length) === prefix) {
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
    $oop.Properties = {
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
         * @returns {object|undefined}
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
         * @this {$oop.Base}
         * @param {string} propertyName Property name.
         * @param value {*} Property value to be assigned.
         * @param {boolean} [isWritable]
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         */
        addProperty: function (propertyName, value, isWritable, isEnumerable, isConfigurable) {
            $assertion
                .isString(propertyName, "Invalid property name")
                .isBooleanOptional(isWritable)
                .isBooleanOptional(isEnumerable)
                .isBooleanOptional(isConfigurable);

            Object.defineProperty(this, propertyName, {
                value       : value,
                writable    : isWritable || $oop.messy,
                enumerable  : isEnumerable,
                configurable: isConfigurable
            });
        },

        /**
         * Adds single accessor property to the context.
         * @this {$oop.Base}
         * @param {string} propertyName Property name.
         * @param {function} [getter] Property getter.
         * @param {function} [setter] Property setter.
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         */
        addAccessor: function (propertyName, getter, setter, isEnumerable, isConfigurable) {
            $assertion
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
         * @this {$oop.Base}
         * @param {object|function} properties Property object or its generator function.
         * @param {boolean} [isWritable]
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         * @returns {$oop.Base}
         */
        addProperties: function (properties, isWritable, isEnumerable, isConfigurable) {
            var propertyNames = Object.keys(properties),
                i, propertyName, property;

            for (i = 0; i < propertyNames.length; i++) {
                // making sure property name is available
                propertyName = propertyNames[i];
                $assertion.isPropertyNameAvailable(propertyName, this, "Direct property conflict");

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

    var self = $oop.Properties;

    $oop.Base.addMethods(/** @lends $oop.Base# */{
        /**
         * Adds a block of public read-only methods to the class it's called on.
         * When $oop.testing is on, methods will be placed on the class differently than other properties,
         * therefore it is important to use .addMethods and .addPrivateMethods for method addition.
         * @param {object} methods Name - value pairs of methods to apply. Values must be functions,
         * or objects implementing a pair of get and set functions.
         * @example
         * var myClass = $oop.extend()
         *    .addMethods({
         *        foo: function () {alert("Foo");},
         *        bar: {get: function () {return "Bar";}
         *    });
         * @returns {$oop.Base}
         */
        addMethods: function (methods) {
            $assertion
                .isAllFunctions(methods, "Invalid methods object")
                .hasNonePrefixed(methods, $oop.privatePrefix, "Some public methods names have the private prefix.");

            self.addProperties.call($oop.Base.getTarget.call(this), methods, false, true, false);

            return this;
        },

        /**
         * Adds a block of private (non-enumerable) read-only methods to the class it's called on.
         * Method names must match the private prefix rule set by `$oop.privatePrefix`.
         * When $oop.testing is on, methods will be placed on the class differently than other properties,
         * therefore it is important to use .addMethods and .addPrivateMethods for method addition.
         * @param {object} methods Name - value pairs of methods to apply. Values must be functions,
         * or objects implementing a pair of get and set functions.
         * @example
         * var myClass = $oop.extend()
         *    .addMethods({
         *        _foo: function () {alert("Foo");},
         *        _bar: {get: function () {return "Bar";}
         *    });
         * @returns {$oop.Base}
         */
        addPrivateMethods: function (methods) {
            $assertion
                .isAllFunctions(methods, "Some private methods are not functions.")
                .isAllPrefixed(methods, $oop.privatePrefix, "Some private method names do not match the required prefix.");

            self.addProperties.call($oop.Base.getTarget.call(this), methods);

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
         * @param {object|$oop.Base} trait Trait object
         * @example
         * MyTrait = $oop.Base.extend()
         *    .addMethods({
         *        init: function () { alert("trait init"); }
         *        foo: function () { alert("hello"); }
         *    });
         * MyClass = $oop.Base.extend()
         *    .addTrait(MyTrait)
         *    .addMethods({ init: function () { MyTrait.init.call(this); } });
         * myInstance = MyClass.create(); // alerts "trait init"
         * myInstance.foo(); // alerts "hello"
         * @returns {$oop.Base}
         */
        addTrait: function (trait) {
            $assertion.isObject(trait, "Invalid trait descriptor");

            // obtaining all property names (including non-enumerable)
            // for $oop classes, only those above the base class will be considered
            var hostTarget = $oop.Base.getTarget.call(this),
                propertyNames = $oop.Properties.getPropertyNames(
                    trait,
                    $oop.Base.isBaseOf(trait) ?
                        $oop.Base :
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
                $assertion.isPropertyNameAvailable(propertyName, this, "Direct property conflict");

                // copying property over w/ original attributes
                property = trait[propertyName];
                Object.defineProperty(
                    typeof property === 'function' ?
                        hostTarget :
                        this,
                    propertyName,
                    $oop.Properties.getPropertyDescriptor(trait, propertyName)
                );
            }

            return this;
        },

        /**
         * Adds trait to current class then extends it, allowing subsequently added methods to override
         * the trait's methods.
         * @param {object|$oop.Base} trait
         * @returns {$oop.Base}
         * @see $oop.Base.addTrait
         */
        addTraitAndExtend: function (trait) {
            return this
                .addTrait(trait)
                .extend();
        },

        /**
         * Adds a block of public (enumerable) writable properties to the current class or instance.
         * @param {object} properties Name-value pairs of properties.
         * @returns {$oop.Base}
         */
        addPublic: function (properties) {
            $assertion.hasNonePrefixed(properties, $oop.privatePrefix, "Some public property names have the private prefix.");

            self.addProperties.call(this, properties, true, true, false);
            return this;
        },

        /**
         * Adds a block of private (non-enumerable) writable properties to the current class or instance.
         * Property names must match the private prefix rule set by `$oop.privatePrefix`.
         * @param {object} properties Name-value pairs of properties.
         * @returns {$oop.base}
         */
        addPrivate: function (properties) {
            $assertion
                .hasNoFunctions(properties, "Invalid private object")
                .isAllPrefixed(properties, $oop.privatePrefix, "Some private property names do not match the required prefix.");

            self.addProperties.call(this, properties, true, false, false);

            return this;
        },

        /**
         * Adds a block of public (enumerable) constant (read-only) properties to the current class or instance.
         * @param {object} properties Name-value pairs of constant properties
         * @returns {$oop.Base}
         */
        addConstants: function (properties) {
            $assertion
                .hasNonePrefixed(properties, $oop.privatePrefix, "Some constant property names have the private prefix.");

            self.addProperties.call(this, properties, false, true, false);
            return this;
        },

        /**
         * Adds a block of private (non-enumerable) constant (read-only) properties to the current class or instance.
         * Property names must match the private prefix rule set by `$oop.privatePrefix`.
         * @param {object} properties Name-value pairs of private constant properties.
         * @returns {$oop.Base}
         */
        addPrivateConstants: function (properties) {
            $assertion
                .hasNoFunctions(properties, "Invalid private constants object")
                .isAllPrefixed(properties, $oop.privatePrefix, "Some private constant names do not match the required prefix.");

            self.addProperties.call(this, properties);

            return this;
        },

        /**
         * Elevates method from class level to instance level. (Or from base class to current class.)
         * Ties context to the object it was elevated to, so methods may be safely passed as event handlers.
         * @param {string} methodName Name of method to elevate.
         * @example
         * ClassA = $oop.Base.extend()
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
         * @returns {$oop.Base}
         */
        elevateMethod: function (methodName) {
            $assertion.isString(methodName, "Invalid method name");

            var base = this.getBase(), // class or base class
                baseMethod = base[methodName],
                elevatedMethod;

            $assertion.isFunction(baseMethod, "Attempted to elevate non-method.", methodName);

            elevatedMethod = {};
            elevatedMethod[methodName] = baseMethod.bind(this);

            self.addProperties.call($oop.Base.getTarget.call(this), elevatedMethod, false, true, false);

            return this;
        },

        /**
         * Elevates multiple methods. Method names are expected to be passed as individual arguments.
         * (In no particular order.)
         * @returns {$oop.Base}
         * @see $oop.Base#elevateMethod
         */
        elevateMethods: function () {
            var base = this.getBase(),
                elevatedMethods = {},
                i, methodName, baseMethod;

            for (i = 0; i < arguments.length; i++) {
                methodName = arguments[i];
                baseMethod = base[methodName];
                elevatedMethods[methodName] = baseMethod.bind(this);
            }

            $assertion.isAllFunctions(elevatedMethods, "Attempted to elevate non-method");

            self.addProperties.call($oop.Base.getTarget.call(this), elevatedMethods, false, true, false);

            return this;
        },

        /**
         * Adds a block of public (enumerable) mock methods (read-only, but removable) to the current instance or class.
         * @param {object} methods Name-value pairs of methods. Values must be functions or getter-setter objects.
         * @example
         * $oop.testing = true;
         * MyClass = $oop.Base.extend()
         *      .addMethods({
         *          init: function () {},
         *          foo: function () {}
         *      });
         * myInstance = MyClass.create();
         * MyClass.addMocks({
         *     foo: function () {return 'FOO';}
         * });
         * myInstance.foo() // returns 'FOO'
         * @see $oop.Base#addMethods
         * @returns {$oop.Base}
         */
        addMocks: function (methods) {
            $assertion
                .assert($oop.testing, "Giant is not in testing mode.")
                .isAllFunctions(methods, "Some mock methods are not functions.");

            self.addProperties.call(this, methods, false, true, true);

            return this;
        },

        /**
         * Removes all mock methods from the current class or instance.
         * @returns {$oop.Base}
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

    $oop.Base.addPublic.call($oop, /** @lends $oop */{
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
