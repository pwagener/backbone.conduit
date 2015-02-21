// Wiring up Backbone with a usable jQuery is a bit of a mess....
var wiring = require('./wiring');

function createConstructor(CollectionType) {
    return function() {
        new CollectionType(wiring.testData);
    }
}

var addOpts = { minSamples: 20 };
var constructorSuite = wiring.createSuite();
constructorSuite
    .add('Backbone.Collection', createConstructor(wiring.Backbone.Collection), addOpts)
    .add('Backbone w/Lodash.Collection', createConstructor(wiring.BackboneLodash.Collection), addOpts)
    .add('Conduit.Collection', createConstructor(wiring.Conduit.Collection), addOpts);

module.exports = constructorSuite;