'use strict';

/**
 * This module provides a mixin for a Backbone.Collection to provide a method,
 * 'fill(...)' that can be used as a performant replacement for
 * 'Collection.reset(...)' in some circumstances.
 */

var _ = require('underscore');
var Backbone = require('backbone');
var shortCircuit = require('./shortCircuit');

function refill(models, options) {

    // Re-assign the Backbone.Model constructor with whatever prototypes exist on the
    // original model Constructor
    var originalModelConstructor = this.model;
    if (_.isFunction(this.model.parse)) {
        shortCircuit.ModelConstructor.prototype.parse = this.model.prototype.parse;
    } else {
        shortCircuit.ModelConstructor.prototype.parse = Backbone.Model.prototype.parse;
    }
    this.model = shortCircuit.ModelConstructor;

    // Re-assign the Backbone.Model.set method
    var originalModelSet = this.model.prototype.set;
    this.model.prototype.set = shortCircuit.modelSet;

    // Re-assign the Backbone.Collection.set method
    this._originalCollectionSet = this.set;
    this.set = shortCircuit.collectionSet;

    // Call reset
    var result = this.reset(models, options);

    // Trigger the other event
    this.trigger('refill', this);

    // Clean up
    this.set = this._originalCollectionSet;
    this.model.prototype.set = originalModelSet;
    this.model = originalModelConstructor;

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
        _.extend(Collection.prototype, mixinObj);
        return Collection;
    }
};