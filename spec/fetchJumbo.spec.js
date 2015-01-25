'use strict';

var mockServer = require('./mockServer');
var Backbone = require('backbone');
var _ = require('underscore');
var fetchJumbo = require('./../src/fetchJumbo');
var when = require('when');

var sampleData = [
    {id: 2, name: "two", first: 0, second: 2},
    {id: 1, name: "one", first: 1, second: 0},
    {id: 3, name: "three", first: 1, second: 2}
];


function callThenResolve(collection, method, resolveValue) {
    resolveValue = resolveValue || collection;

    return when.promise(function(resolve) {
        collection[method]().then(function() {
            resolve(collection);
        });
    });
}

describe("The fetchJumbo module", function() {
    var Collection;
    beforeEach(function() {
        Collection = Backbone.Collection.extend({
            url: '/foo'
        });
        Collection = fetchJumbo.mixin(Collection);
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

    it('provides the method "fetchJumbo(...)"', function() {
        expect(Collection.prototype.fetchJumbo).to.be.a('function');
    });

    it('does not overwrite "fetch"', function() {
        var fetchJumbo = Collection.prototype.fetchJumbo;
        expect(Collection.prototype.fetch).to.be.a('function');

        //noinspection BadExpressionStatementJS
        expect(Collection.prototype.fetch !== fetchJumbo).to.be.true;
    });

    describe('when used in a Collection', function() {
        var collection;
        beforeEach(function() {
            mockServer.add({
                url: '/foo',
                data: sampleData
            });

            collection = new Collection();
        });

        afterEach(function() {
            mockServer.reset();
        });

        it('populates the collection', function(done) {
            var promised = callThenResolve(collection, 'fetchJumbo');
            expect(promised).to.eventually.have.length(3).and.notify(done);
        });

        it('calls "fill" by default', function(done) {
            var fillSpy = this.sinon.spy(collection, 'fill');
            var promised = callThenResolve(collection, 'fetchJumbo');
            promised.then(function() {
                expect(fillSpy.callCount).to.equal(1);
                done();
            });
        });

        it('calls "refill" when "reset" is requested', function(done) {
            var refillSpy = this.sinon.spy(collection, 'refill');
            var promise = when.promise(function(resolve) {
                collection.fetchJumbo({ reset: true }).then(function() {
                    resolve(collection);
                });
            });
            promise.then(function() {
                expect(refillSpy.callCount).to.equal(1);
                done();
            });
        });
    });
});