'use strict';

var Backbone = require('backbone');
var _ = require('underscore');
var when = require('when');

var Conduit = require('src/index');

var config = Conduit.config;
var haul = Conduit.haul;
var mockServer = require('./../mockServer');

var FooCollection = Backbone.Collection.extend({
    url: '/foo'
});
haul.mixin(FooCollection);

function fetchAndWait(collection, options) {
    return when.promise(function(resolve) {
        // Ensure we've finished fetching; might not be synchronous because of 'sortAsync'
        collection.once('sync', function() {
            resolve(collection);
        });

        var haulOpts = _.extend({}, options, {
            sort: true
        });

        collection.haul(haulOpts);
    });
}

describe('The haul module', function() {
    var collection;

    beforeEach(function() {
        collection = new FooCollection(null, {
            comparator: 'name'
        });
        mockServer.add({
            url: '/foo',
            data: this.getSampleData()
        });
    });

    describe('when worker is not enabled', function() {
        var sortSpy;

        beforeEach(function() {
            config.disableWorker();

            // Spy on the to sort technique
            sortSpy = this.sinon.spy(collection, 'sort');

            // Ensure an empty collection
            collection.reset();
        });

        it('receives the sample data', function() {
            expect(fetchAndWait(collection)).to.eventually.have.length(3);
        });

        it('contains sorted data', function(done) {
            fetchAndWait(collection).then(function() {
                expect(collection.at(1).get('name')).to.equal('three');
                done();
            });
        });

        it('uses synchronous sort', function(done) {
            fetchAndWait(collection).then(function() {
                //noinspection BadExpressionStatementJS
                expect(sortSpy.called).to.be.true;
                done();
            });
        });
    });

    describe('when worker is enabled', function() {
        var _useBossToSortSpy;

        beforeEach(function(done) {
            config.enableWorker({
                paths: workerLocation
            }).done(function() {
                done();
            }, function(err) {
                throw new Error('Unexpected testing failure.  Cannot enable worker: ' + err);
            });

            // Spy on the sort technique
            _useBossToSortSpy = this.sinon.spy(collection, '_useBossToSort');
            // Ensure an empty collection
            collection.reset();
        });

        it('receives the sample data', function() {
            expect(fetchAndWait(collection)).to.eventually.have.length(3);
        });

        it('contains sorted data', function(done) {
            fetchAndWait(collection).then(function() {
                expect(collection.at(1).get('name')).to.equal('three');
                done();
            });
        });

        it("won't use asynchronous sort when the collection has data", function(done) {
            // Make sure it has data already
            collection.add({
                id: 100, name: "one hundred", first: 80, second: 20
            });

            fetchAndWait(collection).then(function() {
                //noinspection BadExpressionStatementJS
                expect(_useBossToSortSpy.called).to.be.false;
                done();
            });
        });

        it("will use asynchronous sort for a 'reset'", function(done) {
            // Make sure it has data already
            collection.add({
                id: 100, name: "one hundred", first: 80, second: 20
            });
            fetchAndWait(collection, { reset: true }).then(function() {
                //noinspection BadExpressionStatementJS
                expect(_useBossToSortSpy.called).to.be.true;
                done();
            });
        });

        it("will use asynchronous sort for an empty collection", function(done) {
            fetchAndWait(collection).then(function() {
                //noinspection BadExpressionStatementJS
                expect(_useBossToSortSpy.called).to.be.true;
                done();
            })
        });
    });
});