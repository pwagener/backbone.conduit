'use strict';

var Backbone = require('backbone');
var _ = require('underscore');
var when = require('when');

var Conduit = require('src/index');
var sortAsync = Conduit.sortAsync;

describe('The sortAsync module', function() {
    var Collection;

    var sampleData = [
        {id: 2, name: "two", first: 0, second: 2},
        {id: 1, name: "one", first: 1, second: 0},
        {id: 3, name: "three", first: 1, second: 2}
    ];

    beforeEach(function() {
        Collection = Backbone.Collection.extend();
        Collection = sortAsync.mixin(Collection);
        Conduit.config.setUnderscorePath('/base/node_modules/underscore/underscore.js');
    });

    it('returns a Constructor', function() {
        expect(Collection).to.be.a('function');
    });

    describe('after instantiation', function() {
        var collection;
        beforeEach(function() {
            collection = new Collection();
            collection.reset(sampleData);
            collection.comparator = 'name';
        });

        it('begins with unsorted data', function() {
            expect(collection.at(2).get('name')).to.equal('three');
        });

        it('returns a Promise from "sortAsync"', function () {
            var promise = collection.sortAsync();

            //noinspection BadExpressionStatementJS
            expect(when.isPromiseLike(promise)).to.be.true;
        });

        describe('after resolving the promise', function() {
            var promise;
            beforeEach(function() {
                promise = collection.sortAsync();
            });

            it('resolves the promise to the collection', function() {
                expect(promise).to.eventually.equal(collection);
            });

            it('the resolved collection has the correct length', function(done) {
                promise.then(function(sorted) {
                    expect(sorted.length).to.equal(3);
                    done();
                });
            });


            it('the resolved collection is sorted', function(done) {
                promise.then(function(sorted) {
                    expect(sorted.at(0).get('name'), 'First element').to.equal('one');
                    expect(sorted.at(1).get('name'), 'Second element').to.equal('three');
                    expect(sorted.at(2).get('name'), 'Third element').to.equal('two');
                    done();
                });
            });

        });
    });
});