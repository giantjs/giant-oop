(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class
     * @ignore
     */
    $oop.Surrogate = {
        /**
         * Adds surrogates buffer to class.
         * @this $oop.Base
         */
        initSurrogates: function () {
            this.addConstants(/** @lends $oop.Base# */{
                /**
                 * Container for surrogate info. Added to class via .initSurrogates().
                 * @type {object}
                 */
                surrogateInfo: {
                    /**
                     * @type {function}
                     */
                    preparationHandler: undefined,

                    /**
                     * @type {object[]}
                     */
                    descriptors: []
                }
            });
        },

        /**
         * Retrieves first surrogate fitting constructor arguments.
         * @this $oop.Base
         * @returns {$oop.Base}
         */
        getSurrogate: function () {
            /**
             * Surrogate info property must be the class' own property
             * otherwise surrogates would be checked on instantiating
             * every descendant of the current class, too.
             * This would be wasteful, unnecessary, and confusing.
             */
            if (!hOP.call(this, 'surrogateInfo')) {
                // class has no surrogate
                return this;
            }

            var surrogateInfo = this.surrogateInfo,
                preparationHandler = surrogateInfo.preparationHandler,
                descriptorArguments = preparationHandler && preparationHandler.apply(this, arguments) ||
                    arguments,
                descriptors = surrogateInfo.descriptors,
                descriptorCount = descriptors.length,
                i, descriptor;

            // going through descriptors and determining surrogate
            for (i = 0; i < descriptorCount; i++) {
                descriptor = descriptors[i];

                // determining whether arguments fit next filter
                if (descriptor.filter.apply(this, descriptorArguments)) {
                    return descriptor.namespace[descriptor.className];
                }
            }

            // returning caller as fallback
            return this;
        },

        /**
         * Compares surrogate descriptors for sorting.
         * @param {object} a
         * @param {object} b
         * @returns {number}
         */
        surrogateDescriptorComparer: function (a, b) {
            var priorityA = a.priority,
                priorityB = b.priority;

            return priorityA > priorityB ? -1 : priorityB > priorityA ? 1 : 0;
        }
    };

    $oop.Base.addMethods(/** @lends $oop.Base# */{
        /**
         * Adds a handler to be called before evaluating any of the surrogate filters.
         * The specified handler receives the original constructor arguments and is expected to
         * return a modified argument list (array) that will be passed to the surrogate filters.
         * @param {function} handler
         * @returns {$oop.Base}
         * @see $oop.Base.addSurrogate
         */
        prepareSurrogates: function (handler) {
            $assertion.isFunction(handler, "Invalid handler");

            if (!hOP.call(this, 'surrogateInfo')) {
                $oop.Surrogate.initSurrogates.call(this);
            }

            this.surrogateInfo.preparationHandler = handler;

            return this;
        },

        /**
         * Adds a surrogate class to the current class. Instantiation is forwarded to the first surrogate where
         * the filter returns true. Surrogates are processed in order of descending priority values.
         * @param {object} namespace Namespace in which the surrogate class resides.
         * @param {string} className Surrogate class name. The class the namespace / class name point to does not
         * have to exist (or be resolved when postponed) at the time of adding the filter.
         * @param {function} filter Function evaluating whether the surrogate class specified by the namespace
         * and class name fits the arguments.
         * @param {number} [priority=0] When to evaluate the surrogate among all surrogates applied to a class.
         * Surrogates with higher priority values are processed first.
         * @example
         * var ns = {}; // namespace
         * ns.Horse = $oop.Base.extend()
         *     .prepareSurrogates(function (height) {
         *         return [height < 5]; // isPony
         *     })
         *     .addSurrogate(ns, 'Pony', function (isPony) {
         *         return isPony;
         *     })
         *     .addMethods({ init: function () {} });
         * ns.Pony = ns.Horse.extend()
         *     .addMethods({ init: function () {} });
         * var myHorse = ns.Horse.create(10), // instance of ns.Horse
         *     myPony = ns.Horse.create(3); // instance of ns.Pony
         * @returns {$oop.Base}
         */
        addSurrogate: function (namespace, className, filter, priority) {
            priority = priority || 0;

            $assertion
                .isObject(namespace, "Invalid namespace object")
                .isString(className, "Invalid class name")
                .isFunction(filter, "Invalid filter function");

            if (hOP.call(this, 'instanceRegistry')) {
                // clearing cached instances making sure the surrogate will not be bypassed
                this.clearInstanceRegistry();
            }

            if (!hOP.call(this, 'surrogateInfo')) {
                // initializing surrogate info container
                $oop.Surrogate.initSurrogates.call(this);
            }

            var descriptors = this.surrogateInfo.descriptors;

            // adding descriptor to container
            descriptors.push({
                namespace: namespace,
                className: className,
                filter   : filter,
                priority : priority
            });

            // sorting descriptors so they are in order of (descending) priority
            // (sorting might take O(n*logn), but it's altogether cheaper to sort on addition than on iteration)
            descriptors.sort($oop.Surrogate.surrogateDescriptorComparer);

            return this;
        }
    });
}());
