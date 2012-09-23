/**
 * Property Management.
 *
 * Adding properties and methods to a class or instance.
 */
/*global troop, console */
(function () {
    var self = troop.Properties = {
        //////////////////////////////
        // Utilities

        /**
         * Emits a warning message.
         * @param message {string}
         * @private
         * @static
         */
        _warn: function (message) {
            if (typeof console.warn === 'function') {
                console.warn(message);
            }
        },

        /**
         * Assigns a property to the object using an ES5 property descriptor.
         * Uses either Object.defineProperty, or assignment.
         * @param object {object}
         * @param propertyName {string}
         * @param descriptor {object} ES5 property descriptor.
         * @private
         * @static
         */
        _defineProperty: function (object, propertyName, descriptor) {
            if (troop.sloppy && descriptor.hasOwnProperty('value')) {
                // in sloppy mode, value definitions revert to simple assignments
                object[propertyName] = descriptor.value;
            } else {
                Object.defineProperty(object, propertyName, descriptor);
            }
        },

        /**
         * List of valid method combinations for accessors.
         * @type {object}
         */
        _accessorMethods: {
            'get'    : true,
            'set'    : true,
            'get,set': true,
            'set,get': true
        },

        /**
         * Tells whether an object holds a getter / setter pair.
         * @param object {object} Host object.
         * @return {boolean}
         * @private
         * @static
         */
        _isAccessor: function (object) {
            return Object.prototype.isPrototypeOf(object) &&
                   Object.getPrototypeOf(object) === Object.prototype &&
                   Object.getOwnPropertyNames(object).join(',') in self._accessorMethods &&
                   self._checkType(object, 'function');
        },

        /**
         * Checks type or class of each property against type name.
         * @param object {object} Host object.
         * @param typeName {string|troop.Base} Type name or base class to check.
         * @private
         * @static
         */
        _checkType: function (object, typeName) {
            var isType = typeof typeName === 'string',
                isClass = troop.Base.isPrototypeOf(typeName),
                isFunction = typeName === 'function',
                propertyName, property;

            if (!(isType || isClass)) {
                // typeName is neither string nor troop class
                return false;
            }

            for (propertyName in object) {
                if (object.hasOwnProperty(propertyName)) {
                    property = object[propertyName];
                    if (!(typeof property === 'undefined' ||
                          isFunction && self._isAccessor(property) ||
                          isType && typeof property === typeName ||
                          isClass && typeName.isPrototypeOf(property))
                        ) {
                        self._warn(["Method", propertyName, "doesn't meet type requirement", typeName].join(" "));
                        return false;
                    }
                }
            }

            return true;
        },

        /**
         * Checks property names for prefix.
         * @param object {object} Host object.
         * @param prefix {string} Prefix.
         * @return {boolean} Whether all properties on the object satisfy the prefix condition.
         * @private
         * @static
         */
        _checkPrefix: function (object, prefix) {
            var propertyName;
            for (propertyName in object) {
                if (object.hasOwnProperty(propertyName)) {
                    if (propertyName.substr(0, prefix.length) !== prefix) {
                        self._warn(["Property", propertyName, "doesn't match prefix", prefix].join(" "));
                        return false;
                    }
                }
            }

            return true;
        },

        /**
         * Adds single value property.
         * @param propertyName {string} Property name.
         * @param value {*} Property value to be assigned.
         * @param [isWritable] {boolean}
         * @param [isEnumerable] {boolean}
         * @param [isConfigurable] {boolean}
         * @private
         */
        _addValue: function (propertyName, value, isWritable, isEnumerable, isConfigurable) {
            self._defineProperty(this, propertyName, {
                value       : value,
                writable    : isWritable || troop.messy,
                enumerable  : isEnumerable,
                configurable: isConfigurable
            });
        },

        /**
         * Adds single accessor property.
         * @param propertyName {string} Property name.
         * @param [getter] {function} Property getter.
         * @param [setter] {function} Property setter.
         * @param [isWritable] {boolean}
         * @param [isEnumerable] {boolean}
         * @param [isConfigurable] {boolean}
         * @private
         */
        _addAccessor: function (propertyName, getter, setter, isWritable, isEnumerable, isConfigurable) {
            self._defineProperty(this, propertyName, {
                get         : getter,
                set         : setter,
                enumerable  : isEnumerable,
                configurable: isConfigurable
            });
        },

        /**
         * Adds properties to object with the specified attributes.
         * @this {object}
         * @param properties {object|function} Property object or its generator function.
         * @param [isWritable] {boolean}
         * @param [isEnumerable] {boolean}
         * @param [isConfigurable] {boolean}
         */
        add: function (properties, isWritable, isEnumerable, isConfigurable) {
            var propertyName, property;

            if (typeof properties === 'function') {
                // when function is passed as 'properties'
                // generating property object
                properties = properties.call(this);
            }

            if (typeof properties === 'object') {
                for (propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        property = properties[propertyName];
                        if (self._isAccessor(property)) {
                            self._addAccessor.call(this,
                                propertyName,
                                property.get,
                                property.set,
                                isEnumerable,
                                isConfigurable
                            );
                        } else {
                            self._addValue.call(this,
                                propertyName,
                                property,
                                isWritable,
                                isEnumerable,
                                isConfigurable
                            );
                        }
                    }
                }
            }

            return this;
        },

        /**
         * Determines target of property addition.
         * In testing mode, each class has two prototype levels and
         * methods should go to the lower one, so they may be covered on
         * the other.
         */
        getTarget: function () {
            return troop.testing === true ?
                Object.getPrototypeOf(this) :
                this;
        },

        /**
         * Retrieves the immediate base class of a given child class.
         * @return {troop.Base}
         */
        getBase: function () {
            return troop.testing === true ?
                Object.getPrototypeOf(Object.getPrototypeOf(this)) :
                Object.getPrototypeOf(this);
        },

        //////////////////////////////
        // Class-level

        /**
         * Adds public read-only methods to class.
         * @this {troop.Base} Class object.
         * @param methods {object} Methods.
         */
        addMethod: function (methods) {
            if (self._checkType(methods, 'function')) {
                self.add.call(self.getTarget.call(this), methods, false, true, false);
            }
            return this;
        },

        /**
         * Adds private read-only methods to class.
         * @this {troop.Base} Class object.
         * @param methods {object} Methods.
         */
        addPrivateMethod: function (methods) {
            if (self._checkType(methods, 'function') &&
                self._checkPrefix(methods, troop.privatePrefix)
                ) {
                self.add.call(self.getTarget.call(this), methods, false, false, false);
            }
            return this;
        },

        /**
         * Validates an object for being trait in the context
         * of a host object.
         * @param trait {object} Trait object.
         * @param [host] {object} Host object.
         * @private
         * @static
         */
        _isTrait: function (trait, host) {
            var result = false,
                traitBase,
                hostBase;

            if (Object.prototype.isPrototypeOf(trait)) {
                traitBase = self.getBase.call(trait);
                result = result || traitBase === Object.prototype;
                if (Object.prototype.isPrototypeOf(host)) {
                    hostBase = self.getBase.call(host);
                    result = result || traitBase.isPrototypeOf(hostBase) || traitBase === hostBase;
                }
            }

            return result;
        },

        /**
         * Copies properties and methods from an object
         * and adds them preserving all property attributes.
         * In testing mode, only copies methods!
         * @param trait {object} Object containing traits.
         */
        addTrait: function (trait) {
            // obtaining all property names (including non-enumerable)
            var traitTarget = self.getTarget.call(trait),
                hostTarget = self.getTarget.call(this),
                propertyNames,
                i, propertyName;

            if (!self._isTrait(trait, this)) {
                throw new TypeError("Trait doesn't satisfy common ancestor requirement.");
            }

            propertyNames = Object.getOwnPropertyNames(traitTarget);
            for (i = 0; i < propertyNames.length; i++) {
                propertyName = propertyNames[i];
                self._defineProperty(
                    hostTarget,
                    propertyName,
                    Object.getOwnPropertyDescriptor(traitTarget, propertyName)
                );
            }

            return this;
        },

        //////////////////////////////
        // Class and instance-level

        /**
         * Adds public writable members to class or instance.
         * @this {troop.Base} Class or instance object.
         * @param properties {object} Properties and methods.
         */
        addPublic: function (properties) {
            return self.add.call(this, properties, true, true, false);
        },

        /**
         * Adds pseudo-private writable members to class or instance.
         * @this {troop.Base} Class or instance object.
         * @param properties {object} Properties and methods.
         */
        addPrivate: function (properties) {
            if (self._checkPrefix(properties, troop.privatePrefix)) {
                self.add.call(this, properties, true, false, false);
            }
            return this;
        },

        /**
         * Adds public constant (read-only) members to instance.
         * @this {troop.Base} Instance object.
         * @param properties {object} Constant properties.
         */
        addConstant: function (properties) {
            return self.add.call(this, properties, false, true, false);
        },

        /**
         * Adds private constant (read-only & non-enumerable) members to instance.
         * @this {troop.Base} Instance object.
         * @param properties {object} Constant properties.
         */
        addPrivateConstant: function (properties) {
            if (self._checkPrefix(properties, troop.privatePrefix)) {
                self.add.call(this, properties, false, false, false);
            }
            return this;
        },

        /**
         * Elevates method from class level to instance level.
         * (Or from base class to child class.)
         * Ties context to the object it was elevated to.
         * @param methodName {string} Name of method to elevate.
         */
        elevateMethod: function (methodName) {
            var that = this, // instance or child class
                base = self.getBase.call(this), // class or base class
                methods;

            if (typeof base[methodName] === 'function') {
                methods = {};
                methods[methodName] = function () {
                    return base[methodName].apply(that, arguments);
                };
                self.addMethod.call(this, methods);
            }

            return this;
        },

        //////////////////////////////
        // Class and instance-level

        /**
         * Adds public mock methods (read-only, but removable) members to instance or class.
         * @this {troop.Base} Instance or class object.
         * @param methods {object} Mock methods.
         */
        addMock: function (methods) {
            if (self._checkType(methods, 'function')) {
                self.add.call(this, methods, false, true, true);
            }
            return this;
        },

        /**
         * Removes all mock methods from class or instance.
         */
        removeMocks: function () {
            var key;
            for (key in this) {
                if (this.hasOwnProperty(key) && typeof this[key] === 'function') {
                    delete this[key];
                }
            }
            return this;
        }
    };

    self.addPublic.call(troop, {
        /**
         * Prefix applied to names of private properties and methods.
         */
        privatePrefix: '_',

        /**
         * When true, plain assignment is used instead of ES5 property
         * definition when applying properties.
         */
        sloppy: false,

        /**
         * When true, all properties are writable, so they can be
         * modified through assignment.
         */
        messy: false
    });
}());
