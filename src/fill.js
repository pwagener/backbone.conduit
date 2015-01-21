'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var shortCircuit = require('./shortCircuit');

function fill(models, options) {
    // Create the short-circuit
    shortCircuit.setup(this);

    // Silence any add/change/remove events
    options = options ? _.clone(options) : {};
    var requestedEvents = !options.silent;
    options.silent = true;

    // Call set
    var result = this.set(models, options);

    // Trigger the other event
    this.trigger('fill', this, result);

    // Clean up
    shortCircuit.teardown(this);

    if (requestedEvents && this.comparator) {
        this.sort();
    }

    // Return the result
    return result;
}

var mixinObj = {
    fill: fill
};

module.exports = {
    mixin: function(Collection) {
        _.extend(Collection.prototype, mixinObj);
        return Collection;
    }
};