// Wiring up Backbone with a usable jQuery is a bit of a mess....
var wiring = require('./wiring');

var addOpts = { minSamples: 20 };
var setFillSuite = wiring.createSuite();
setFillSuite
    .add('Backbone..fill', wiring.createAndCallFunc(wiring.Backbone.Collection, 'set'), addOpts)
    .add('Backbone w/Lodash..fill', wiring.createAndCallFunc(wiring.BackboneLodash.Collection, 'set'), addOpts)
    .add('Conduit..fill', wiring.createAndCallFunc(wiring.Conduit.Collection, 'fill'), addOpts);

module.exports = setFillSuite;
