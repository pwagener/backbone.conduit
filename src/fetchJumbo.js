'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var fill = require('./fill');
var refill = require('./refill');

/**
 * This utility method is taken from backbone.js verbatim
 */
var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
        if (error) error(model, resp, options);
        model.trigger('error', model, resp, options);
    };
};

/**
 * This method is a replacement for Backbone.Collection.fetch that will use
 * Conduit.Collection.fill/refill instead of Backbone.Collection.set/reset when data
 * is successfully returned from the server.
 */
function fetchJumbo(options) {
    options = options ? _.clone(options) : {};
    if (options.parse === void 0) options.parse = true;
    var success = options.success;
    var collection = this;
    options.success = function(resp) {
        // This is the interesting line:  use refill/fill instead of reset/set
        var method = options.reset ? 'refill' : 'fill';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
    };
    wrapError(this, options);
    return this.sync('read', this, options);
}

var mixinObj = {
    fetchJumbo: fetchJumbo
};


module.exports = {
    mixin: function(Collection) {

        if (!_.isFunction(Collection.prototype.refill)) {
            refill.mixin(Collection);
        }

        if (!_.isFunction(Collection.prototype.fill)) {
            fill.mixin(Collection);
        }

        _.extend(Collection.prototype, mixinObj);
        return Collection;
    }
};
