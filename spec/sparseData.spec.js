'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var when = require('when');

var mockServer = require('./mockServer');

var sparseData = require('./../src/sparseData');
var InThreadBoss = require('./InThreadBoss');


describe("The sparseData module", function() {
    var Collection;

    beforeEach(function() {
        Collection = Backbone.Collection.extend({
            url: '/foo'
        });

        Collection = sparseData.mixin(Collection);
    });

    it('returns a Constructor when mixed in', function() {
        expect(Collection).to.be.a('function');
    });

    describe('after collection instantiation', function() {
        var collection;

        beforeEach(function () {
            collection = new Collection();
        });

        it('is an instance of Backbone.Collection', function () {
            expect(collection).to.be.an.instanceOf(Backbone.Collection);
        });

        it('provides a "populate" method', function () {
            expect(collection.prepare).to.be.a('function');
        });

        it('provides the "haul" method', function () {
            expect(collection.haul).to.be.a('function');
        });

        it('provides the "refill" method', function () {
            expect(collection.refill).to.be.a('function');
        });

        it('provides the "fill" method', function () {
            expect(collection.fill).to.be.a('function');
        });

        it('throws an Error on prohibited methods', function () {
            var prohibited = [
                // Methods where the Conduit variant should be used
                "set",
                "reset",
                "fetch",

                // All the Underscore methods error
                'forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
                'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter',
                'select',
                'reject', 'every', 'all', 'some', 'any', 'include', 'contains',
                'invoke',
                'max', 'min', 'toArray', 'size', 'first', 'head', 'take',
                'initial', 'rest',
                'tail', 'drop', 'last', 'without', 'difference', 'indexOf',
                'shuffle',
                'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition',
                // Underscore attribute methods
                'groupBy', 'countBy', 'sortBy', 'indexBy',

                // Writing methods should currently fail
                "add",
                "remove",
                "push",
                "pop",
                "unshift",
                "shift",

                // Other manipulation methods as well
                "slice",
                "sort",
                "pluck",
                "where",
                "findWhere",
                "parse",
                "clone",
                "create"
            ];

            _.each(prohibited, function (method) {
                this.expectError(collection, method);
            }, this);
        });
    });

    describe('when communicating with the worker boss', function() {
        var bossPromiseSpy, collection;

        beforeEach(function() {
            var mockBoss = {
                makePromise: function() {
                    return when.resolve();
                }
            };

            bossPromiseSpy = this.sinon.spy(mockBoss, 'makePromise');
            collection = new Collection();
            collection._boss = mockBoss;
        });

        afterEach(function() {
            bossPromiseSpy.restore();
        });

        it('calls "setData" when adding data with "refill"', function() {
            collection.refill(this.getSampleData());

            expect(bossPromiseSpy.called).to.be.true;
            var callArgs = bossPromiseSpy.args[0];
            expect(callArgs[0]).to.have.property('method', 'setData');
        });

        it('calls "mergeData" when adding data with "fill"', function() {
            var extraData = [
                {id: 5, name: "five", first: 3, second: 2}
            ];
            collection.fill(extraData);

            expect(bossPromiseSpy.called).to.be.true;
            var callArgs = bossPromiseSpy.args[0];
            expect(callArgs[0]).to.have.property('method', 'mergeData');
        });

        it('calls "mergeData" when responding to "haul" success', function(done) {
            var data = this.getSampleData();
            mockServer.add({
                url: '/foo',
                data: data
            });

            collection.haul().then(function() {
                expect(bossPromiseSpy.called).to.be.true;
                var callArgs = bossPromiseSpy.args[0];
                expect(callArgs[0]).to.have.property('method', 'mergeData');

                done();
            });
        });

        it('calls "setData" when responding to "haul" with reset', function(done) {
            var data = this.getSampleData();
            mockServer.add({
                url: '/foo',
                data: data
            });

            collection.haul({ reset: true }).then(function() {
                expect(bossPromiseSpy.called).to.be.true;
                var callArgs = bossPromiseSpy.args[0];
                expect(callArgs[0]).to.have.property('method', 'setData');

                done();
            });
        });
    });

    // The sparseData module modifies the 'haul' process at a specific point to direct
    // all the hard work to the worker.
    describe('when hauling data', function() {
        var collection, fillSpy, refillSpy, testBoss;

        beforeEach(function() {
            var data = this.getSampleData();
            collection = new Collection();
            collection._boss = testBoss = new InThreadBoss();
            mockServer.add({
                url: '/foo',
                data: data
            });

            fillSpy = this.sinon.spy(collection, 'fill');
            refillSpy = this.sinon.spy(collection, 'refill');
        });

        it('has the correct length after "haul" succeeds', function(done) {
            collection.haul({
                success: function() {
                    expect(collection).to.have.length(3);
                    done();
                }
            });
        });

        it('calls "fill" if we do not specify the "reset" option', function(done) {
            collection.haul({
                success: function() {
                    expect(fillSpy.callCount).to.equal(1);
                    expect(refillSpy.callCount).to.equal(0);
                    done();
                }
            });
        });

        it('calls "refill" if we specify the "reset" option', function(done) {
            collection.haul({
                reset: true,
                success: function() {
                    expect(refillSpy.callCount).to.equal(1);
                    expect(fillSpy.callCount).to.equal(0);
                    done();
                }
            });
        });

        it('has the correct length after "sync" fires', function(done) {
            collection.once('sync', function() {
                expect(collection).to.have.length(3);
                done();
            });
            collection.haul();
        });

        it('provides a custom converter for "text json"', function(done) {
            // NOTE:  Not a great test, as we have to hook into a private function.
            // The behavior we really want test, that the string is provided to the
            // worker for parsing there, cannot be easily tested with the current
            // implementation of MockServer.
            var privateHaulSpy = this.sinon.spy(collection, '_conduitHaul');
            var testJsonStr = JSON.stringify(this.getSampleData());
            collection.haul({
                success: function() {
                    var haulOptions = privateHaulSpy.getCall(0).args[0];
                    expect(haulOptions).to.have.property('converters');
                    expect(haulOptions.converters).to.have.property('text json');
                    var jsonConverter = haulOptions.converters['text json'];
                    expect(jsonConverter).to.be.a('function');
                    expect(jsonConverter(testJsonStr)).to.equal(testJsonStr);

                    done();
                }
            });
        });
    });

    describe('when its collection has data', function() {
        var collection;
        beforeEach(function() {
            // We mock out an in-thread-like boss
            collection = new Collection();
            collection._boss = new InThreadBoss();
            collection.refill(this.getSampleData());
        });

        it('resolves a request for a model by ID', function(done) {
            collection.prepare({
                id: 2
            }).done(function(result) {
                expect(result).to.be.instanceOf(Backbone.Model);
                done();
            }, function(err) {
                console.log('Test Error: ' + err);
            });
        });

        it('resolves a request for IDs to multiple models', function(done) {
            collection.prepare({
                ids: [1, 3]
            }).done(function(result) {
                expect(result).to.be.instanceOf(Array);
                expect(result).to.have.length(2);

                var first = result[0];
                expect(first).to.be.instanceOf(Backbone.Model);
                done();
            }, function(err) {
                console.log('Test Error: ' + err);
            });
        });

        it('resolves a request for an index to a model', function(done) {
            collection.prepare({
                index: 0
            }).done(function(result) {
                expect(result).to.be.instanceOf(Backbone.Model);

                done();
            }, function(err) {
                console.log('Test Error: ', err);
            });
        });

        it('sorts its data in the worker', function(done) {
            collection.sortAsync({
                comparator: 'name'
            }).then(function() {
                return collection.prepare({
                    indexes: { min: 0, max: 2 }
                });
            }).then(function(models) {
                expect(models).to.have.length(3);
                expect(models[0].get('name')).to.equal('one');
                expect(models[1].get('name')).to.equal('three');
                expect(models[2].get('name')).to.equal('two');

                done();
            });
        });
    });

    describe('after preparing its collection', function() {
        var collection;

        beforeEach(function(done) {
            // We mock out an in-thread-like boss
            collection = new Collection();
            collection._boss = new InThreadBoss();
            collection.refill(this.getSampleData());

            // Then prepare some subset of that data
            collection.prepare({
                ids: [1, 3]
            }).done(function() {
                done();
            }, function(err) {
                console.log('Test Error: ' + err);
            });
        });

        it('has the correct length', function() {
            expect(collection).to.have.length(3);
        });

        it('can use "get" on prepared models', function() {
            var oneModel = collection.get(1);
            expect(oneModel).to.be.instanceOf(Backbone.Model);
            expect(oneModel.toJSON()).to.have.property('name', 'one');
        });

        it('cannot use "get" on  unprepared models', function() {
            var boundMethod = _.bind(collection.get, collection, 2);
            expect(boundMethod).to.throw(Error);
        });

        it('can use "at"  on prepared models', function() {
            var secondModel = collection.at(1);
            expect(secondModel).to.be.instanceOf(Backbone.Model);
            expect(secondModel.toJSON()).to.have.property('name', 'one');
        });

        it('cannot use "at" on unprepared models', function() {
            var boundMethod = _.bind(collection.at, collection, 0);
            expect(boundMethod).to.throw(Error);
        });

        it('can determine if a given ID has been prepared', function() {
            expect(collection.isPrepared({
                id: 1
            })).to.be.true;
        });

        it('can determine if a given ID has not been prepared', function() {
            expect(collection.isPrepared({
                id: 2
            })).to.be.false
        });

        it('can determine some IDs have been prepared', function() {
            expect(collection.isPrepared({
                ids: [1, 3]
            })).to.be.true;

            expect(collection.isPrepared({
                ids: [1, 2]
            })).to.be.false;
        });

        it('can determine if a given index has been prepared', function() {
            expect(collection.isPrepared({
                index: 0
            })).to.be.false;

            expect(collection.isPrepared({
                index: 1
            })).to.be.true;

            expect(collection.isPrepared({
                index: 2
            })).to.be.true;

        });

        it('can determine if a range of indexes has been prepared', function() {
            expect(collection.isPrepared({
                indexes: { min: 0, max: 1}
            })).to.be.false;

            expect(collection.isPrepared({
                indexes: { min: 1, max: 2 }
            })).to.be.true;
        });
    });
});
