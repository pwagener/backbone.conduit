'use strict';

var Backbone = require('backbone');

var config = require('./config');
var fill = require('./fill');
var refill = require('./refill');
var Collection = require('./Collection');
var haul = require('./haul');
var sortAsync = require('./sortAsync');

Backbone.Conduit = module.exports = {
    config: config,

    fill: fill,
    refill: refill,
    haul: haul,
    sortAsync: sortAsync,

    Collection: Collection,

    // Deprecated
    fetchJumbo: require('./fetchJumbo')
};
