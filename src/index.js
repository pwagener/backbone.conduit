'use strict';

var Backbone = require('backbone');

var config = require('./config');
var fill = require('./fill');
var refill = require('./refill');
var Collection = require('./Collection');
var fetchJumbo = require('./fetchJumbo');
var sortAsync = require('./sortAsync');

Backbone.Conduit = module.exports = {
    config: config,

    fill: fill,
    refill: refill,
    fetchJumbo: fetchJumbo,
    sortAsync: sortAsync,

    Collection: Collection
};
