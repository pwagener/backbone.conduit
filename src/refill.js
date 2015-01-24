/**
 * This module provides a mixin for a Backbone.Collection to provide a method,
 * 'fill(...)' that can be used as a performant replacement for
 * 'Collection.reset(...)' in some circumstances.
 */

var _ = require('underscore');
var Backbone = require('backbone');
var shortCircuit = require('./shortCircuit');

/**
 * Implementation of the refill function as an alternative to Backbone.Collection.reset
 */
function refill(models, options) {

    // Short-circuit this collection
    shortCircuit.setup(this);

    // Call reset
    var result = this.reset(models, options);

    // Clean up
    shortCircuit.teardown(this);

    // Return the result
    return result;
}

// The object that will be added to any prototype when mixing this
// module.
var mixinObj = {
    refill: refill
};


module.exports = {
    mixin: function(Collection) {
        _.extend(Collection.prototype, mixinObj );
        return Collection;
    }
};
