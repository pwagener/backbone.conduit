'use strict';

/**
 * This module is shared between 'fill' and 'refill' as where the short-circuit method
 * implementations live.
 */
var _ = require('underscore');
var Backbone = require('backbone');


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
    options = options || {};
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

/**
 * This will create a Constructor suitable for a short-circuited creation that looks & acts like OriginalModel
 * @param OriginalModel The model whose behavior to mimic
 */
function generateConduitModel(OriginalModel) {
    var defaults = _.result(OriginalModel.prototype, 'defaults');

    var ConduitModel = function(attributes, options) {
        var attrs = attributes || {};
        options || (options = {});
        //noinspection JSUnusedGlobalSymbols
        this.cid = _.uniqueId('c');
        this.attributes = {};
        if (options.collection) this.collection = options.collection;
        if (options.parse) attrs = this.parse(attrs, options) || {};

        // Significant change from Backbone.Model: only do defaults if necessary
        if (defaults) {
            attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        }

        // Second significant change from Backbone.Model: use quickModelSet in place of a regular set
        quickModelSet.apply(this, [attrs, options]);

        //noinspection JSUnusedGlobalSymbols
        this.changed = {};
        this.initialize.apply(this, arguments);
    };

    // Build the prototype for the Model, overriding any 'set' behavior, and finding all the Backbone-y prototype
    // methods we can find.
    _.extend(ConduitModel.prototype,
        OriginalModel.prototype,
        OriginalModel.__super__
    );

    return ConduitModel;
}

/**
 * Set up a short-circuit for adding models to a given collection
 * @param collection The collection instance to short-circuit
 * @return A collection of original functions that were moved by the shortCircuit, which can be provided to 'teardown'
 * to reverse the process.
 */
function setup(collection) {
    // Store the original model & generate a short-circuited one
    collection._originalModel = collection.model;
    collection.model = generateConduitModel(collection.model);

    // Re-assign the Backbone.Collection.set method
    collection._originalCollectionSet = collection.set;
    collection.set = quickCollectionSet;

    // Return the short-circuited collection
    return collection;
}

/**
 * Method to tear down a previously-created short circuit
 * @param collection The short-circuited collection
 */
function teardown(collection) {
    collection.set = collection._originalCollectionSet;
    collection.model = collection._originalModel;

    delete collection._originalCollectionSet;
    delete collection._originalModel;
}

module.exports = {
    setup: setup,
    teardown: teardown
};