/**
 * This module provides a mixin for a Backbone.Collection to provide a method,
 * 'fill(...)' that can be used as a performant replacement for
 * 'Collection.reset(...)' in some circumstances.
 */

var _ = require('underscore');

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
    // Force silence
    var needEvents = !options.silent;
    options.silent = true;

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

    // TODO:  handle events after the fact

    return returnedModels;
}

function fill(models, options) {

    // Re-assign the Backbone.Model.set method
    var originalModelSet = this.model.prototype.set;
    this.model.prototype.set = quickModelSet;

    // Re-assign the Backbone.Collection.set method
    this._originalCollectionSet = this.set;
    this.set = quickCollectionSet;

    // Call reset
    var result = this.reset(models, options);

    // Trigger the other event
    this.trigger('fill', this);

    // Clean up
    this.model.prototype.set = originalModelSet;
    this.set = this._originalCollectionSet;
    delete this._originalCollectionSet;

    // Return the result
    return result;
}

module.exports = {
    mixinObject: {
        fill: fill
    },

    mixin: function(Collection) {
        _.extend(Collection.prototype, this.mixinObject);
        return Collection;
    }
};
