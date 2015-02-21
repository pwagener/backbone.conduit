// Wiring up Backbone with a usable jQuery is a bit of a mess....
var wiring = require('./wiring');

var addOpts = { minSamples: 20 };
var resetRefillSuite = wiring.createSuite();
resetRefillSuite
    .add('Backbone..reset', wiring.createAndCallFunc(wiring.Backbone.Collection, 'reset'), addOpts)
    .add('Backbone w/Lodash..reset', wiring.createAndCallFunc(wiring.BackboneLodash.Collection, 'reset'), addOpts)
    .add('Conduit..refill', wiring.createAndCallFunc(wiring.Conduit.Collection, 'refill'), addOpts);

module.exports = resetRefillSuite;