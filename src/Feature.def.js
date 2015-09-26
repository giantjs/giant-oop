(function () {
    "use strict";

    /**
     * Implements methods to detect environment features relevant to OOP and testing.
     * @class
     */
    $oop.Feature = {
        /**
         * Determines whether read-only properties may be covered up by assignment.
         * @returns {boolean}
         */
        canAssignToReadOnly: function () {
            var base, child;

            // creating base object with read-only property
            base = Object.defineProperty({}, 'p', {
                writable: false,
                value   : false
            });

            // deriving object
            child = Object.create(base);

            // attempting to change read-only property on base
            try {
                child.p = true;
            } catch (e) {
                // change failed, property is RO
                return false;
            }

            // determining whether change was successful
            return child.p === true;
        },

        /**
         * Determines whether ES5 property attributes are available.
         * @returns {boolean}
         */
        hasPropertyAttributes: function () {
            // creating object with read-only property
            var o = Object.defineProperty({}, 'p', {
                writable: false,
                value   : false
            });

            // attempting to change property
            try {
                o.p = true;
            } catch (e) {
                // change failed, property is RO
                return true;
            }

            // when property can be changed, defineProperty is sure to be polyfill
            return !o.p;
        }
    };

    /**
     * Whether methods should be writable (environmental)
     * @type {boolean}
     */
    $oop.writable = !$oop.Feature.canAssignToReadOnly();

    /**
     * Whether Giant OOP is in testing mode (application state)
     * TODO: Rename to something more specific.
     * @type {boolean}
     */
    $oop.testing = false;
}());
