/**
 * This module provides an out-of-the-box Collection implementation that leverages the
 * Conduit capabilities to deal with large amounts of data.
 */

var Backbone = require('backbone');
var fill = require('./fill');
var _ = require('underscore');

var Collection = fill.mixin(Backbone.Collection);
var originalFetch = Collection.prototype.fetch;

Collection.prototype._useFillForReset = function() {
    this.reset = this.fill;
};

Collection.prototype._useOriginalReset = function() {
    this.reset = originalFetch;
};

Collection.prototype.fetch = function(options) {
    options = options || {};

    // See if they've disabled fill on fetch
    var fillOnFetch = _.isUndefined(options.fillOnFetch) ?
        true :
        options.fillOnFetch;

    if (fillOnFetch) {
        // Install a custom converter for this request
        // (we really should wrap any explicitly provided converter)
        options.converters = _.extend({}, options.converters, {
            "text json": this._useFillForReset
        });

        // Install a "complete" function to ensure we remove the short-circuit
        // on success or failure.  Note this means our short-circuit is still active
        // during any success/fail callbacks.
        var origComplete = options.complete;
        options.complete = _.bind(function(jqXhr, textStatus) {
            this._useOriginalReset();
            if (origComplete) {
                return origComplete(jqXhr, textStatus);
            }
        }, this);
    }

    return originalFetch.apply(this, arguments);
};

module.exports = Collection;
