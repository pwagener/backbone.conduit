/**
 *  NOTE:  this module has been renamed 'haul.js'.  The 'fetchJumbo' module
 *  and related function will be removed in a future release.
 */
'use strict';

var _ = require('underscore');

var haul = require('./haul');

function warn() {
    console.log("WARNING: The 'fetchJumbo' module has been renamed 'haul'.");
    console.log("WARNING: 'fetchJumbo' will be removed in a subsequent release.");
}

module.exports = {
    mixin: function(Collection) {
        warn();
        haul.mixin(Collection);

        _.extend(Collection.prototype, {
            fetchJumbo: function(options) {
                warn();
                return this.haul(options);
            }
        });

        return Collection;
    }
};