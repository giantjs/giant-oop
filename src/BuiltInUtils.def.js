(function () {
    "use strict";

    /**
     * Extends built-in objects, like String.prototype, with custom conversion methods.
     * Restricts extension to conversion methods, ie. all such methods should take the instance
     * of the built-in object and convert that to something else. Consequentially, all extension
     * methods must obey the naming convention "to....".
     * @param {object} builtInPrototype prototype object to extend.
     * @param {object} methods Override methods. All method names must be prefixed with "to".
     */
    $oop.extendBuiltIn = function (builtInPrototype, methods) {
        $assertion
            .isAllFunctions(methods, "Invalid methods")
            .isAllPrefixed(methods, 'to', "Invalid method names");

        $oop.Properties.addProperties.call(builtInPrototype, methods, false, false, false);
    };
}());
