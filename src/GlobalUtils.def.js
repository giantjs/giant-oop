/*global giant */
(function () {
    "use strict";

    giant.Properties.addProperties.call(giant, /** @lends giant */{
        /**
         * @param {object} functions
         * @returns {giant}
         */
        addGlobalFunctions: function (functions) {
            giant.isAllFunctions(functions, "Invalid functions object");
            giant.Properties.addProperties.call(giant, functions, false, true, false);
            return this;
        },

        /**
         * Adds constants to the global giant namespace.
         * @param {object} constants Override methods. All method names must be prefixed with "to".
         * @returns {giant}
         */
        addGlobalConstants: function (constants) {
            giant.Properties.addProperties.call(giant, constants, false, true, false);
            return this;
        }
    });
}());
