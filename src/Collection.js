/**
 * This module provides an out-of-the-box Collection implementation that leverages the
 * Conduit capabilities to deal with large amounts of data.
 */

var Backbone = require('backbone');
var _ = require('underscore');

var refill = require('./refill');
var fill = require('./fill');

// Extend Backbone.Collection and provide the 'refill' method
var Collection = Backbone.Collection.extend({ });
refill.mixin(Collection);
fill.mixin(Collection);

module.exports = Collection;