'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var when = require('when');

var config = require('./config');
var fill = require('./fill');
var refill = require('./refill');
var sortAsync = require('./sortAsync');

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
        // This is one change from 'fetch':  use refill/fill instead of reset/set
        var method = options.reset ? 'refill' : 'fill';

        // Function that will finish the fetch operation
        var finishFetch = function(data) {
            collection[method](data, options);
            if (success) success(collection, data, options);
            collection.trigger('sync', collection, data, options);
        };

        // If sorting requested, do it asynchronously
        var sortable = collection.comparator && (options.at == null) && options.sort !== false;

        if (sortable && config.isBrowserEnv() && config.getUnderscorePath()) {
            // We can use the asynchronous sorting.  So, ensure we don't do synchronous sort
            options.sort = false;

            // Do the async sort, then set the values.
            var sortPromise = collection._useWorkerToSort({
                data: resp,
                comparator: collection.comparator
            });
            sortPromise.then(function(sorted) {
                finishFetch(sorted);
            });
        } else {
            // Finish the fetch the usual way, with synchronous sorting if requested.
            finishFetch(resp);
        }
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

        if (!_.isFunction(Collection.prototype.sortAsync)) {
            sortAsync.mixin(Collection);
        }

        _.extend(Collection.prototype, mixinObj);
        return Collection;
    }
};
