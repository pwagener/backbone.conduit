'use strict';

var Backbone = require('backbone');

var config = require('./config');
var fill = require('./fill');
var refill = require('./refill');
var haul = require('./haul');
var sparseData = require('./sparseData');

var QuickCollection = require('./QuickCollection');
var SparseCollection = require('./SparseCollection');

var WrappedWorker = require('./WrappedWorker');

Backbone.Conduit = module.exports = {
    config: config,

    fill: fill,
    refill: refill,
    haul: haul,
    sparseData: sparseData,
 
    WrappedWorker: WrappedWorker,

    QuickCollection: QuickCollection,
    SparseCollection: SparseCollection
};
