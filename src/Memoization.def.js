/*global giant */
(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class
     * @ignore
     */
    giant.Memoization = {
        /**
         * Adds instance to registry. Must be called on class object!
         * @this {giant.Base} Giant class
         * @param {string} key Instance key
         * @param {giant.Base} instance Instance to be memoized
         */
        addInstance: function (key, instance) {
            this.instanceRegistry[key] = instance;
        },

        /**
         * Fetches a memoized instance from the registry.
         * @param {string} key
         * @returns {giant.Base}
         */
        getInstance: function (key) {
            var instanceRegistry = this.instanceRegistry;
            return instanceRegistry ? instanceRegistry[key] : undefined;
        },

        /**
         * Maps instance to registry
         * Receives constructor arguments
         * @returns {string} Instance key
         */
        mapInstance: function () {
            return this.instanceMapper.apply(this, arguments);
        }
    };

    giant.Base.addMethods(/** @lends giant.Base# */{
        /**
         * Assigns instance key calculator to class. Makes class memoized.
         * @param {function} instanceMapper Instance key mapper function.
         * @example
         * var MyClass = giant.Base.extend()
         *     .setInstanceMapper(function (arg) {return '' + arg;})
         *     .addMethods({
         *         init: function () {}
         *     }),
         *     myInstance1 = MyClass.create('foo'),
         *     myInstance2 = MyClass.create('foo');
         * MyClass.isMemoized() // true
         * myInstance 1 === myInstance2 // true
         * @returns {giant.Base}
         */
        setInstanceMapper: function (instanceMapper) {
            giant
                .isFunction(instanceMapper, "Invalid instance key calculator")
                .assert(!hOP.call(this, 'instanceMapper'), "Instance mapper already set");

            this
                .addMethods(/** @lends giant.Base# */{
                    /**
                     * Maps constructor arguments to instance keys in the registry.
                     * Added to class via .setInstanceMapper().
                     * @function
                     * @returns {string}
                     */
                    instanceMapper: instanceMapper
                })
                .addPublic(/** @lends giant.Base# */{
                    /**
                     * Lookup registry for instances of the memoized class.
                     * Has to be own property as child classes may put their instances here, too.
                     * Added to class via .setInstanceMapper().
                     * @type {object}
                     */
                    instanceRegistry: {}
                });

            return this;
        },

        /**
         * Tells whether the current class (or any of its base classes) is memoized.
         * @returns {boolean}
         * @see giant.Base.setInstanceMapper
         */
        isMemoized: function () {
            return typeof this.instanceMapper === 'function';
        },

        /**
         * Clears instance registry. After the registry is cleared, a new set of instances will be created
         * for distinct constructor arguments.
         * @returns {giant.Base}
         * @see giant.Base.setInstanceMapper
         */
        clearInstanceRegistry: function () {
            giant.assert(hOP.call(this, 'instanceRegistry'), "Class doesn't own an instance registry");
            this.instanceRegistry = {};
            return this;
        }
    });
}());
