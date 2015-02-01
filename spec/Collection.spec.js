'use strict';

var Collection = require('./../src/Collection');
var prototype = Collection.prototype;

describe("The Conduit.Collection", function() {

    it('has a "fill" method', function() {
        expect(prototype.fill).to.be.a('function');
    });

    it('has a "refill" method', function() {
        expect(Collection.prototype.refill).to.be.a('function');
    });

    it('has a "fetchJumbo" method', function() {
        expect(Collection.prototype.fetchJumbo).to.be.a('function');
    });

    it('has a "sortAsync" method', function() {
        expect(Collection.prototype.sortAsync).to.be.a('function');
    });
});