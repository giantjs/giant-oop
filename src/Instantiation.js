/*global giant */
(function () {
    "use strict";

    var Memoization = giant.Memoization,
        Surrogate = giant.Surrogate,
        Base = giant.Base;

    giant.Base.addMethods(/** @lends giant.Base# */{
        /**
         * Creates a new instance of the class it was called on. Arguments passed to .create will be handed over
         * to the user-defined .init method, which will decorate the new instance with properties.
         * @see giant.Base.setInstanceMapper
         * Instantiation might create a new instance of a subclass if the current class has surrogates.
         * @see giant.Base.addSurrogate
         * @example
         * var MyClass = giant.Base.extend({
         *         init: function (foo) {
         *            this.foo = 'bar';
         *         }
         *     }),
         *     myInstance = MyClass.create("bar");
         * myInstance.foo // "bar"
         * @returns {giant.Base}
         */
        create: function () {
            var self = this.surrogateInfo && Surrogate.getSurrogate.apply(this, arguments) ||
                       this,
                instanceMapper = self.instanceMapper,
                instanceKey,
                that;

            // attempting to fetch memoized instance
            if (instanceMapper) {
                instanceKey = Memoization.mapInstance.apply(self, arguments);
                that = Memoization.getInstance.call(self, instanceKey);
                if (that) {
                    return that;
                }
            }

            // instantiating class
            that = Base.extend.call(self);

            // initializing instance properties
            if (typeof self.init === 'function') {
                // running instance initializer
                self.init.apply(that, arguments);
            }

            // storing instance for memoized class
            if (instanceMapper && typeof instanceKey !== 'undefined') {
                Memoization.addInstance.call(self, instanceKey, that);
            }

            return that;
        }
    });
}());
