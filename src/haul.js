'use strict';

var _ = require('underscore');
var Backbone = require('backbone');

var config = require('./config');
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
 * This method is called when the 'haul' method has successfully received data.  It is broken out and mixed into
 * the collection so that other modules (i.e. 'sparseData') have a good place to hook into.
 * @param response The response
 * @param options The options that were originally provided to 'haul'
 * @param origSuccessCallback The original callback on success
 * @private
 */
var _onHaulSuccess = function(response, options, origSuccessCallback) {
    // This is key change from 'fetch':  use refill/fill instead of reset/set
    var method = options.reset ? 'refill' : 'fill';
    this[method](response, options);
    if (origSuccessCallback) origSuccessCallback(this, response, options);
    this.trigger('sync', this, response, options);
};

/**
 * This method is a replacement for Backbone.Collection.fetch that will use
 * Conduit.QuickCollection.fill/refill instead of Backbone.Collection.set/reset when data
 * is successfully returned from the server.
 */
function haul(options) {
    options = options ? _.clone(options) : {};
    if (options.parse === void 0) options.parse = true;
    var success = options.success;
    var collection = this;
    options.success = function(resp) {
        collection._onHaulSuccess(resp, options, success);
    };
    wrapError(this, options);
    return this.sync('read', this, options);
}

var mixinObj = {
    haul: haul,

    _onHaulSuccess: _onHaulSuccess
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
