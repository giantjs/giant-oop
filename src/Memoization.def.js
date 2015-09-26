(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class
     * @ignore
     */
    $oop.Memoization = {
        /**
         * Adds instance to registry. Must be called on class object!
         * @this {$oop.Base} Giant class
         * @param {string} key Instance key
         * @param {$oop.Base} instance Instance to be memoized
         */
        addInstance: function (key, instance) {
            this.instanceRegistry[key] = instance;
        },

        /**
         * Fetches a memoized instance from the registry.
         * @param {string} key
         * @returns {$oop.Base}
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

    $oop.Base.addMethods(/** @lends $oop.Base# */{
        /**
         * Assigns instance key calculator to class. Makes class memoized.
         * @param {function} instanceMapper Instance key mapper function.
         * @example
         * var MyClass = $oop.Base.extend()
         *     .setInstanceMapper(function (arg) {return '' + arg;})
         *     .addMethods({
         *         init: function () {}
         *     }),
         *     myInstance1 = MyClass.create('foo'),
         *     myInstance2 = MyClass.create('foo');
         * MyClass.isMemoized() // true
         * myInstance 1 === myInstance2 // true
         * @returns {$oop.Base}
         */
        setInstanceMapper: function (instanceMapper) {
            $assertion
                .isFunction(instanceMapper, "Invalid instance key calculator")
                .assert(!hOP.call(this, 'instanceMapper'), "Instance mapper already set");

            this
                .addMethods(/** @lends $oop.Base# */{
                    /**
                     * Maps constructor arguments to instance keys in the registry.
                     * Added to class via .setInstanceMapper().
                     * @function
                     * @returns {string}
                     */
                    instanceMapper: instanceMapper
                })
                .addPublic(/** @lends $oop.Base# */{
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
         * @see $oop.Base.setInstanceMapper
         */
        isMemoized: function () {
            return typeof this.instanceMapper === 'function';
        },

        /**
         * Clears instance registry. After the registry is cleared, a new set of instances will be created
         * for distinct constructor arguments.
         * @returns {$oop.Base}
         * @see $oop.Base.setInstanceMapper
         */
        clearInstanceRegistry: function () {
            $assertion.assert(hOP.call(this, 'instanceRegistry'), "Class doesn't own an instance registry");
            this.instanceRegistry = {};
            return this;
        }
    });
}());
