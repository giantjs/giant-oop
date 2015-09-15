/*global giant */
(function () {
    "use strict";

    /**
     * Adds constants to the global giant namespace.
     * @param {object} constants Override methods. All method names must be prefixed with "to".
     * @returns {giant}
     */
    giant.addGlobalConstants = function (constants) {
        giant.Properties.addProperties.call(giant, constants, false, true, false);
        return this;
    };
}());
