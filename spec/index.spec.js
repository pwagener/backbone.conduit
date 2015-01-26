'use strict';


var Conduit = require('./../src/index');

describe('The index module', function() {

    it('provides "fill" module', function() {
        expect(Conduit.fill).to.be.an('object');
    });

    it('provides "refill" module', function() {
        expect(Conduit.refill).to.be.an('object');
    });

    it('provides "fetchJumbo" module', function() {
        expect(Conduit.fetchJumbo).to.be.an('object');
    });

    it('provides the "Collection"', function() {
        expect(Conduit.Collection).to.be.a('function');
    });

});