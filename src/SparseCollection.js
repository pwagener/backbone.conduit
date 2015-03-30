'use strict';
/**
 * This module provides the SparseCollection, a Backbone.Collection implementation
 * that has the Conduit.sparseData module already mixed into it.
 */
var Backbone = require('backbone');
var sparseData = require('./sparseData');

var SparseCollection = Backbone.Collection.extend({});
sparseData.mixin(SparseCollection);

module.exports = SparseCollection;