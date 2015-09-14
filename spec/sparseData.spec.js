'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var when = require('when');

var InThreadBoss = require('./InThreadBoss');

var mockConduitWorker = require('./worker/mockConduitWorker');

var sparseData = require('./../src/sparseData');


function makeInThreadBoss() {
    mockConduitWorker.reset();

    var inThreadBoss = new InThreadBoss([
        // Method handlers that can be called directly
        require('./../src/worker/data/setData'),
        require('./../src/worker/data/prepare'),
        require('./../src/worker/data/mergeData'),
        require('./../src/worker/data/sortBy'),
        require('./../src/worker/data/filter'),
        require('./worker/data/mockLoad'),
        require('./../src/worker/data/map'),
        require('./../src/worker/data/reduce')
    ]);

    // Extra methods that may be referred to by handlers.
    inThreadBoss.registerOther(require('./worker/data/addFirstAndSecond'));
    inThreadBoss.registerOther(require('./worker/data/sumOfFirstAndSecondProperties'));

    return inThreadBoss;
}

describe("The sparseData module", function() {
    var Collection;

    beforeEach(function() {
        Collection = Backbone.Collection.extend({
            url: '/foo',

            postFetchTransform: {
                method: 'calculateDifference'
            }
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

        it('provided no extra Components to the Boss', function() {

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

    describe('when communicating with the boss', function() {
        var bossPromiseSpy, collection;

        beforeEach(function() {
            var mockBoss = makeInThreadBoss();

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

        it('calls "load" when running "haul"', function(done) {
            collection.haul().then(function() {
                expect(bossPromiseSpy.called).to.be.true;
                var callArgs = bossPromiseSpy.args[0];
                expect(callArgs[0]).to.have.property('method', 'load');
                var loadArgs = callArgs[0].arguments[0];
                expect(loadArgs).to.not.have.property('reset');

                done();
            });
        });

        it('calls "load" when running "haul" with reset', function(done) {
            collection.haul({ reset: true }).then(function() {
                expect(bossPromiseSpy.called).to.be.true;
                var callArgs = bossPromiseSpy.args[0];
                expect(callArgs[0]).to.have.property('method', 'load');
                var loadArgs = callArgs[0].arguments[0];
                expect(loadArgs).to.have.property('reset', true);

                done();
            });
        });
    });

    // The sparseData module modifies the 'haul' process at a specific point to direct
    // all the hard work to the worker.
    describe('when hauling data', function() {
        var collection, fillSpy, refillSpy, testBoss, makePromiseSpy;

        beforeEach(function() {
            collection = new Collection();
            collection._boss = testBoss = makeInThreadBoss();
            makePromiseSpy = this.sinon.spy(testBoss, 'makePromise');

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

        it('provides the postFetchTransform option', function(done) {
            collection.haul().then(function() {
                expect(makePromiseSpy.callCount).to.equal(1);
                var args = makePromiseSpy.getCall(0).args;
                var loadArgs = args[0].arguments[0];
                expect(loadArgs).to.have.property('postFetchTransform');
                expect(loadArgs.postFetchTransform).to.eql({ method: 'calculateDifference' });
                done();
            });
        });
    });

    describe('when its collection has data', function() {
        var collection;
        beforeEach(function() {
            // We mock out an in-thread-like boss
            collection = new Collection();
            collection._boss = makeInThreadBoss();

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
                property: 'name'
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

        it('filters its data in the worker', function(done) {
            collection.filterAsync({
                where: {
                    name: 'one'
                }
            }).then(function() {
                return collection.prepare({
                    indexes: { min: 0, max: 2 }
                });
            }).then(function(models) {
                expect(models).to.have.length(1);
                done();
            });
        });

        it('maps its data in the worker', function(done) {
            collection.mapAsync({
                mapper: 'addFirstAndSecond'
            }).then(function() {
                return collection.prepare({
                    indexes: { min: 0, max: 2 }
                });
            }).then(function(models) {
                expect(models).to.have.length(3);
                expect(models[0]).to.have.property('id', 2);
                expect(models[0].get('third')).to.equal(2);

                expect(models[1]).to.have.property('id', 1);
                expect(models[1].get('third')).to.equal(1);

                expect(models[2]).to.have.property('id', 3);
                expect(models[2].get('third')).to.equal(3);

                done();
            });
        });

        it('reduces data in the worker', function(done) {
            collection.reduceAsync({
                reducer: 'sumOfFirstAndSecondProperties',
                memo: 0
            }).then(function(result) {
                expect(result).to.equal(6);
                done();
            });
        });
    });

    describe('after preparing its collection', function() {
        var collection, preparedSpy;

        beforeEach(function(done) {
            // We mock out an in-thread-like boss
            collection = new Collection();
            collection._boss = makeInThreadBoss();
            collection.refill(this.getSampleData());

            preparedSpy = this.sinon.spy();
            collection.on('prepared', preparedSpy);

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

        it('fired the "prepared" event', function() {
            expect(preparedSpy.callCount).to.equal(1);
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
