'use strict';

var mockServer = require('./mockServer');
var Backbone = require('backbone');
var _ = require('underscore');
var haul = require('./../src/haul');
var when = require('when');

function callThenResolve(collection, method, arg) {
    return when.promise(function(resolve) {
        collection[method](arg).then(function() {
            resolve(collection);
        });
    });
}

describe("The haul module", function() {
    var Collection;
    beforeEach(function() {
        Collection = Backbone.Collection.extend({
            url: '/foo'
        });
        Collection = haul.mixin(Collection);
    });

    it('returns a Constructor', function() {
        expect(Collection).to.be.a('function');
    });

    it('mixes in "refill" if not already done', function() {
        expect(Collection.prototype.refill).to.be.a('function');
    });

    it('mixes in "fill" if not already done', function() {
        expect(Collection.prototype.fill).to.be.a('function');
    });

    it('provides the method "haul(...)"', function() {
        expect(Collection.prototype.haul).to.be.a('function');
    });

    it('does not overwrite "fetch"', function() {
        var haul = Collection.prototype.haul;
        expect(Collection.prototype.fetch).to.be.a('function');

        //noinspection BadExpressionStatementJS
        expect(Collection.prototype.fetch !== haul).to.be.true;
    });

    describe('when used in a Collection', function() {
        var collection;
        beforeEach(function() {
            mockServer.add({
                url: '/foo',
                data: this.getSampleData()
            });

            collection = new Collection();
        });

        afterEach(function() {
            mockServer.reset();
            collection.comparator = null;
        });

        it('populates the collection', function(done) {
            callThenResolve(collection, 'haul').then(function(collection) {
                expect(collection).to.have.length(3);
                done();
            });
        });

        it('calls "fill" by default', function(done) {
            var fillSpy = this.sinon.spy(collection, 'fill');
            callThenResolve(collection, 'haul').then(function() {
                expect(fillSpy.callCount).to.equal(1);
                done();
            });
        });

        it('calls "refill" when "reset" is requested', function(done) {
            var refillSpy = this.sinon.spy(collection, 'refill');
            callThenResolve(collection, 'haul', {reset: true}).then(function() {
                expect(refillSpy.callCount).to.equal(1);
                done();
            });
        });

        it('sorts when requested', function(done) {
            collection.once('sync', function() {
                // Make sure it's sorted
                expect(collection.at(0).get('name')).to.equals('one');
                done();
            });
            collection.comparator = 'name';
            collection.haul({ sort: true });
        });
    });
});