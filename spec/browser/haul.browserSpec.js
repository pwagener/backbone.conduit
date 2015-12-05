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

function haulAndWait(collection, options) {
    return when.promise(function(resolve) {
        // Ensure we've finished fetching; might not be synchronous
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

    describe('when hauling fresh data', function() {
        var sortSpy;

        beforeEach(function() {
            config.disableWorker();

            // Spy on the to sort technique
            sortSpy = this.sinon.spy(collection, 'sort');

            // Ensure an empty collection
            collection.reset();
        });

        it('receives the sample data', function(done) {
            haulAndWait(collection).then(function() {
                expect(collection).to.have.length(3);
                done();
            });
        });

        it('contains sorted data', function(done) {
            haulAndWait(collection).then(function() {
                expect(collection.at(1).get('name')).to.equal('three');
                done();
            });
        });

        it('uses synchronous sort', function(done) {
            haulAndWait(collection).then(function() {
                //noinspection BadExpressionStatementJS
                expect(sortSpy.called).to.be.true;
                done();
            });
        });
    });
});