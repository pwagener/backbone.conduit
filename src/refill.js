/**
 * This module provides a mixin for a Backbone.Collection to provide a method,
 * 'fill(...)' that can be used as a performant replacement for
 * 'Collection.reset(...)' in some circumstances.
 */

var _ = require('underscore');
var Backbone = require('backbone');
var shortCircuit = require('./shortCircuit');

/**
 * This method is used as a replacement for the Backbone.Model constructor.  It allows
 * us to only calculate default values when requested.
 */
var QuickModelConstructor = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    //noinspection JSUnusedGlobalSymbols
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};

    // One significant change from Backbone.Model: only do defaults if necessary
    var defaults = _.result(this, 'defaults');
    if (defaults) {
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    }

    this.set(attrs, options);
    //noinspection JSUnusedGlobalSymbols
    this.changed = {};
    this.initialize.apply(this, arguments);
};
_.extend(QuickModelConstructor.prototype, { set: quickModelSet }, Backbone.Model.prototype);

/**
 * This function is swapped into a Backbone.Model's prototype when models are going to be
 * added to a collection in order to not do unnecessary work.
 */
function quickModelSet(key, val) {
    // Just assign the attribute & move on.
    var attrs, current;
    if (key == null) return this;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (typeof key === 'object') {
        attrs = key;
    } else {
        (attrs = {})[key] = val;
    }

    // Check for changes of `id`.
    if (this.idAttribute in attrs) {
        this.id = attrs[this.idAttribute];
    }

    // NOTE:  no validation, un-setting, _previousAttributes updating
    current = this.attributes;
    for (var attr in attrs) {
        // NOTE:  no changes detection & event triggering

        //noinspection JSUnfilteredForInLoop
        val = attrs[attr];

        //noinspection JSUnfilteredForInLoop
        current[attr] = val;
    }

    return this;
}

/**
 * This function is used in place of the Backbone.Collection.set(...).
 * @param models
 * @param options
 * @returns {*}
 */
function quickCollectionSet(models, options) {
    // Force no-sort up front
    var needsSort = options.sort;
    if (options.sort) {
        options.sort = false;
    }

    var returnedModels = this._originalCollectionSet(models, options);

    // Handle sorting after we have set everything
    if (needsSort && _.isArray(returnedModels)) {
        this.sort();
        returnedModels = _.clone(this.models);
    }

    return returnedModels;
}

function refill(models, options) {

    // Short-circuit this collection
    shortCircuit.setup(this);

    // Call reset
    var result = this.reset(models, options);

    // Trigger the other event
    this.trigger('refill', this);

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
