'use strict';

var Backbone = require('backbone');
var mockServer = require('./../mockServer');

var Conduit = require('src/index');
var config = Conduit.config;

// The code we're testing
var sparseData = Conduit.sparseData;

// The custom collection we'll use to exercise sparseData
var FooCollection = Backbone.Collection.extend({
    url: '/foo'
});
sparseData.mixin(FooCollection);

describe('The sparseData module', function() {
    var collection, sampleData;

    beforeEach(function(done) {
        collection = new FooCollection(null, {
            comparator: 'name'
        });
        sampleData = this.getSampleData();
        mockServer.add({
            url: '/foo',
            data: sampleData
        });

        config.enableWorker({
            paths: 'base/dist',
            debug: true
        }).then(function() {
            collection.haul({
                success: function() { done() }
            });
        });
    });

    it('begins with a collection of length 3', function() {
        expect(collection).to.have.length(3);
    });

    it('receives models when preparing data by indexes', function(done) {
        collection.prepare({
            indexes: { min: 0, max: 1000 }
        }).then(function(models) {
            expect(models).to.have.length(3);
            expect(models[0].toJSON()).to.deep.equal({
                id: 2, name: 'two', first: 0, second: 2
            });
            done();
        });
    });

    it('can prepare data by ids', function(done) {
        collection.prepare({
            ids: [1, 2, 3]
        }).then(function(models) {
            expect(models).to.have.length(3);
            expect(models[2].toJSON()).to.deep.equal({
                id: 3, name: 'three', first: 1, second: 2
            });
            done();
        });
    });

    it('can "get" models after preparing data', function(done) {
        collection.prepare({
            ids: [1, 3]
        }).then(function() {
            var idOne = sampleData[1];
            expect(collection.get(1).toJSON()).to.deep.equal(idOne);
            expect(collection.at(1).toJSON()).to.deep.equal(idOne);

            var idThree = sampleData[2];
            expect(collection.get(3).toJSON()).to.deep.equal(idThree);
            expect(collection.at(2).toJSON()).to.deep.equal(idThree);
            done();
        });
    });

    it('errors on "get" of an unfetched ID', function(done) {
        collection.prepare({
            ids: [ 2, 3]
        }).then(function() {
            var bound = _.bind(collection.get, collection, 1);
            expect(bound).to.throw(Error);
            done();
        });
    });
});