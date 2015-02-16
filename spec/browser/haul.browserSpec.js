'use strict';

var Backbone = require('backbone');
var when = require('when');

var config = require('./../../src/config');
var haul = require('./../../src/haul');
var mockServer = require('./../mockServer');

var FooCollection = Backbone.Collection.extend({
    url: '/foo'
});
haul.mixin(FooCollection);


function fetchAndWait(collection) {
    return when.promise(function(resolve) {
        // Ensure we've finished fetching; might not be synchronous because of 'sortAsync'
        collection.once('sync', function() {
            resolve(collection);
        });

        collection.haul({
            sort: true
        });
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

    describe('when Underscore path is not set', function() {
        var sortSpy;

        beforeEach(function() {
            config.setUnderscorePath(null);

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

    describe('when Underscore path is set', function() {
        var _useWorkerToSortSpy;

        beforeEach(function() {
            config.setUnderscorePath(window.underscorePath);

            // Spy on the to sort technique
            _useWorkerToSortSpy = this.sinon.spy(collection, '_useWorkerToSort');
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

        it('uses asynchronous sort', function(done) {
            fetchAndWait(collection).then(function() {
                //noinspection BadExpressionStatementJS
                expect(_useWorkerToSortSpy.called).to.be.true;
                done();
            });
        });
    });
});