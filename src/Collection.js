/**
 * This module provides an out-of-the-box Collection implementation that leverages the
 * Conduit capabilities to deal with large amounts of data.
 */

var Backbone = require('backbone');
var _ = require('underscore');

var refill = require('./refill');
var fill = require('./fill');
var fetchJumbo = require('./fetchJumbo');

// Extend Backbone.Collection and provide the 'refill' method
var Collection = Backbone.Collection.extend({ });
fetchJumbo.mixin(Collection);

module.exports = Collection;