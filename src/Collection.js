/**
 * This module provides an out-of-the-box Collection implementation that leverages the
 * Conduit capabilities to deal with large amounts of data.
 */

var Backbone = require('backbone');
var _ = require('underscore');

var fill = require('./fill');
var refill = require('./refill');
var sortAsync = require('./sortAsync');
var fetchJumbo = require('./fetchJumbo');

// Extend Backbone.Collection and provide the 'refill' method
var Collection = Backbone.Collection.extend({ });

// Add all the relevant modules to the new Collection type
fill.mixin(Collection);
refill.mixin(Collection);
sortAsync.mixin(Collection);
fetchJumbo.mixin(Collection);

module.exports = Collection;