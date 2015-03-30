'use strict';


var Conduit = require('./../src/index');

describe('The index module', function() {

    it('provides "fill" module', function() {
        expect(Conduit.fill).to.be.an('object');
    });

    it('provides "refill" module', function() {
        expect(Conduit.refill).to.be.an('object');
    });

    it('provides "haul" module', function() {
        expect(Conduit.haul).to.be.an('object');
    });

    it('provides the "QuickCollection"', function() {
        expect(Conduit.QuickCollection).to.be.a('function');
    });

    it('provides the "SparseCollection"', function() {
        expect(Conduit.SparseCollection).to.be.a('function');
    });

});