/**
 * This module provides an out-of-the-box Collection implementation that leverages the
 * Conduit capabilities to deal with large amounts of data.
 */

var Backbone = require('backbone');
var _ = require('underscore');

var refill = require('./refill');
var fill = require('./fill');
var fetchJumbo = require('./fetchJumbo');
var sortAsync = require('./sortAsync');

// Extend Backbone.Collection and provide the 'refill' method
var Collection = Backbone.Collection.extend({ });
fetchJumbo.mixin(Collection);
sortAsync.mixin(Collection);

module.exports = Collection;