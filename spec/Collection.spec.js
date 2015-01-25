'use strict';

var Collection = require('./../src/Collection');

describe("The Conduit.Collection", function() {

    it('is has a "fill" method', function() {
        expect(Collection.prototype.fill).to.be.a('function');
    });

    it('is has a "refill" method', function() {
        expect(Collection.prototype.refill).to.be.a('function');
    });

    it('is has a "fetchJumbo" method', function() {
        expect(Collection.prototype.fetchJumbo).to.be.a('function');
    });

});