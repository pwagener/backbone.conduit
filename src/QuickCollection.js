'use strict';

/**
 * This module provides an out-of-the-box Collection implementation that leverages the
 * Conduit capabilities to deal with large amounts of data.
 */

var Backbone = require('backbone');
var _ = require('underscore');

var fill = require('./fill');
var refill = require('./refill');
var haul = require('./haul');

// Act like a Backbone.Collection, but use 'refill'
var Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);

    // Difference from Backbone:  use 'refill' instead of 'reset'
    if (models) {
        this.refill(models, _.extend({silent: true}, options));
    }
};
_.extend(Collection.prototype, Backbone.Collection.prototype);
Collection.extend = Backbone.Collection.extend;

// Add all the relevant modules to the new Collection type
fill.mixin(Collection);
refill.mixin(Collection);
haul.mixin(Collection);

module.exports = Collection;