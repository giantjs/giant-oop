(function () {
    "use strict";

    $oop.Properties.addProperties.call($oop, /** @lends $oop */{
        /**
         * @param {object} functions
         * @returns {$oop}
         */
        addGlobalFunctions: function (functions) {
            $assertion.isAllFunctions(functions, "Invalid functions object");
            $oop.Properties.addProperties.call(this, functions, false, true, false);
            return this;
        },

        /**
         * Adds constants to the global $oop namespace.
         * @param {object} constants Constants to be added. Should include primitive values only.
         * @returns {$oop}
         */
        addGlobalConstants: function (constants) {
            $oop.Properties.addProperties.call(this, constants, false, true, false);
            return this;
        }
    });
}());
