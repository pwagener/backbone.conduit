'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var when = require('when');

var InThreadBoss = require('./InThreadBoss');

var mockConduitWorker = require('./worker/mockConduitWorker');

var sparseData = require('./../src/sparseData');


function makeInThreadBoss(sinon) {
    mockConduitWorker.reset();

    var inThreadBoss = new InThreadBoss(sinon, [
        // Method handlers that can be called directly
        require('./../src/worker/data/setData'),
        require('./../src/worker/data/prepare'),
        require('./../src/worker/data/mergeData'),
        require('./../src/worker/data/sortBy'),
        require('./../src/worker/data/filter'),
        require('./worker/data/mockRestGet'),
        require('./../src/worker/data/map'),
        require('./../src/worker/data/reduce')
    ]);

    // Extra methods that may be referred to by handlers.
    inThreadBoss.registerOther(require('./worker/data/addFirstAndSecond'));
    inThreadBoss.registerOther(require('./worker/data/sumOfFirstAndSecondProperties'));

    return inThreadBoss;
}

describe("The sparseData module", function() {
    var WriteableCollection, ReadOnlyCollection, collection, preparedSpy;

    var setUpCollectionForTest = function(CollectionConstructor, done) {
        // We mock out an in-thread-like boss
        collection = new CollectionConstructor();
        collection._boss = makeInThreadBoss(this.sinon);
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
    };

    beforeEach(function() {
        // Collection is a writeable
        WriteableCollection = Backbone.Collection.extend({
            url: '/foo',

            postFetchTransform: {
                method: 'calculateDifference'
            },

            conduit: {
                writeable: true
            }
        });
        sparseData.mixin(WriteableCollection);

        ReadOnlyCollection = Backbone.Collection.extend({
            url: '/foo',

            postFetchTransform: {
                method: 'calculateDifference'
            },

            conduit: {
                suppressWriteableWarning: true
            }
        });
        sparseData.mixin(ReadOnlyCollection);
    });


    it('returns a Constructor when mixed in', function() {
        expect(WriteableCollection).to.be.a('function');
    });

    describe('after collection instantiation', function() {
        var collection;

        beforeEach(function () {
            collection = new WriteableCollection();
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

        it('provides the "prepare" method', function() {
            expect(collection.prepare).to.be.a('function');
        });

        it('provides the "isPrepared" method', function() {
            expect(collection.isPrepared).to.be.a('function');
        });

        // TODO:  verify other methods are provided

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
        var bossPromiseSpy, collection, mockBoss;

        beforeEach(function() {
            mockBoss = makeInThreadBoss(this.sinon);

            bossPromiseSpy = mockBoss.makePromise;
            collection = new WriteableCollection();
            collection._boss = mockBoss;
        });

        it('delegates to the Boss when immediately creating the worker', function() {
            collection.createWorkerNow();
            expect(mockBoss.createWorkerNow.callCount).to.equal(1);
        });

        it('delegates to the Boss when immediately stopping the worker', function() {
            collection.stopWorkerNow();
            expect(mockBoss.terminate.callCount).to.equal(1);
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

        it('calls "restGet" when running "haul"', function(done) {
            collection.haul().then(function() {
                expect(bossPromiseSpy.called).to.be.true;
                var callArgs = bossPromiseSpy.args[0];
                expect(callArgs[0]).to.have.property('method', 'restGet');
                var getArgs = callArgs[0].arguments[0];
                expect(getArgs).to.not.have.property('reset');

                done();
            });
        });

        it('calls "restGet" when running "haul" with reset', function(done) {
            collection.haul({ reset: true }).then(function() {
                expect(bossPromiseSpy.called).to.be.true;
                var callArgs = bossPromiseSpy.args[0];
                expect(callArgs[0]).to.have.property('method', 'restGet');
                var getArgs = callArgs[0].arguments[0];
                expect(getArgs).to.have.property('reset', true);

                done();
            });
        });
    });

    // The sparseData module modifies the 'haul' process at a specific point to direct
    // all the hard work to the worker.
    describe('when hauling data', function() {
        var collection, fillSpy, refillSpy, testBoss, makePromiseSpy;

        beforeEach(function() {
            collection = new WriteableCollection();
            collection._boss = testBoss = makeInThreadBoss(this.sinon);
            makePromiseSpy = testBoss.makePromise;

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
            collection = new WriteableCollection();
            collection._boss = makeInThreadBoss(this.sinon);

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
                    indexes: { min: 0, max: 3 }
                });
            }).then(function(models) {
                expect(models).to.have.length(3);
                expect(models[0].get('name')).to.equal('one');
                expect(models[1].get('name')).to.equal('three');
                expect(models[2].get('name')).to.equal('two');

                done();
            });
        });

        it('un-prepares models after sorting', function(done) {
            collection.prepare({ id: 3 })
                .then(function() {
                    return collection.sortAsync({
                        property: 'name'
                    })
                }).then(function() {
                    expect(collection.isPrepared({ id: 3 })).to.be.false;
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
                    indexes: { min: 0, max: 3 }
                });
            }).then(function(models) {
                expect(models).to.have.length(1);
                done();
            });
        });

        it('maps its data in the worker', function(done) {
            collection.mapAsync({
                method: 'addFirstAndSecond'
            }).then(function() {
                return collection.prepare({
                    indexes: { min: 0, max: 3 }
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
                method: 'sumOfFirstAndSecondProperties',
                memo: 0
            }).then(function(result) {
                expect(result).to.equal(6);
                done();
            });
        });
    });

    describe('after preparing its collection', function() {
        beforeEach(function(done) {
            setUpCollectionForTest.call(this, WriteableCollection, done);
        });

        it('has the correct length', function() {
            expect(collection).to.have.length(3);
        });

        it('fired the "prepared" event', function() {
            expect(preparedSpy.callCount).to.equal(1);
        });

        it('can use "restGet" on prepared models', function() {
            var oneModel = collection.get(1);
            expect(oneModel).to.be.instanceOf(Backbone.Model);
            expect(oneModel.toJSON()).to.have.property('name', 'one');
        });

        it('cannot use "restGet" on  unprepared models', function() {
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
                indexes: { min: 0, max: 2 }
            })).to.be.false;

            expect(collection.isPrepared({
                indexes: { min: 1, max: 3 }
            })).to.be.true;
        });

        it('begins with no dirty models', function() {
            expect(collection.hasDirtyData()).to.be.false;
        });

        describe('when a model has changed', function() {
            var modelThree;
            beforeEach(function(done) {
                setUpCollectionForTest.call(this, WriteableCollection, function() {
                    expect(collection.hasDirtyData()).to.be.false;
                    // Change a model within the collection
                    modelThree = collection.get(3);
                    modelThree.set({
                        first: 3,
                        second: 0
                    });

                    done();
                });
            });

            it('detects a dirty model', function() {
                expect(collection.hasDirtyData()).to.be.true;
            });

            it('actively sweeps dirty models when requested', function(done) {
                collection.cleanDirtyData().then(function() {
                    expect(collection.hasDirtyData()).to.be.false;
                    done();
                });
            });

            it('sweeps automatically after a short delay', function(done) {
                collection.on('sweepComplete', function() {
                    done();
                });
            });

            it('fires multiple "sweepComplete" events when appropriate', function(done) {
                // Collection has been changed once in 'beforeEach'; make another
                // change so we have more than one thing that needs changing.
                var modelOne = collection.get(1);
                modelOne.set({ first: 0, second: 1 });

                var spy = this.sinon.spy();
                collection.on('sweepComplete', spy);

                collection.cleanDirtyData().then(function() {
                    expect(collection.hasDirtyData()).to.be.false;
                    expect(spy.callCount).to.equal(2);

                    // Make sure the event was triggered for both models
                    var targets = [];
                    targets.push(spy.getCall(0).args[0]);
                    targets.push(spy.getCall(1).args[0]);
                    expect(targets).to.contain(modelThree);
                    expect(targets).to.contain(modelOne);

                    done();
                });
            });

            it('keeps the already-prepared, changed values', function() {
                expect(modelThree.get('first')).to.equal(3);
            });

            xit('removes attributes in the worker when appropriate', function(done) {
                modelThree.unset('second');
                collection.cleanDirtyData().then(function() {
                    // Re-prepare the data of the changed model to get the data from the
                    // worker
                    return collection.prepare({ id: 3 })
                }).then(function(prepared) {
                    expect(prepared.get('second')).to.be.undefined;
                    done();
                });
            });

            xit('recalculates the index when the change affects sorting', function(done) {
                collection.sortAsync({ property: 'name' })
                    .then(function() {
                        return collection.prepare({
                            indexes: { min: 0, max: 3 }
                        });
                    }).then(function() {
                        // This change should affect sorting
                        return modelThree.set('name', 'THREE');
                    }).then(function() {
                        // Wait for changes to propagate to the worker
                        return collection.cleanDirtyData();
                    }).then(function() {
                        // All three models should still be prepared
                        expect(collection.isPrepared({
                            indexes: { min: 0, max: 3 }
                        })).to.be.true;

                        // Should now be 'THREE' 'one' 'two'
                        var firstModel = collection.at(0);
                        expect(firstModel.id).to.equal(3);

                        done();
                    });
            });
        });

        describe('when a new model is added as raw data', function() {
            beforeEach(function(done) {
                setUpCollectionForTest.call(this, WriteableCollection, function() {
                    expect(collection.hasDirtyData()).to.be.false;
                    collection.addAsync({
                        id: 10, name: 'ten', first: 7, second: 3
                    });

                    done();
                });
            });

            it('indicates dirty data', function() {
                expect(collection.hasDirtyData()).to.be.true;
            });

            it('does not update the "length" prior to sweeping', function() {
                expect(collection).to.have.length(3);
            });

            it('indicates no dirty models after sweeping');

            it('updates the "length" after sweeping');

            it('provides the correct length after sweeping');

            it('can prepare the new model after sweeping');
        });

        describe('when a new model is added as a Model instance', function() {

            it('indicates dirty data');
        });

        describe('when a model is removed (Collection.remove)', function() {

            it('indicates there id dirty data, but no dirty models');

        });

        describe('when a model is created via the Collection (Collection.create)', function() {

            it('indicates a model is dirty');

            // TODO: others....
        });

        describe('when a model is destroyed (Model.destroy)', function() {
            it('indicates there is dirty data, but no dirty models');

            it('sends the DELETE request to the worker');

            it('removes the model from the collection');

            it('provides the correct length after sweeping');
        });
    });

    describe('after changing a model from a read-only collection', function() {

        beforeEach(function(done) {
            setUpCollectionForTest.call(this, ReadOnlyCollection, function() {
                    expect(collection.hasDirtyData()).to.be.false;
                    // Change a model within the collection
                    var modelThree = collection.get(3);
                    modelThree.once('change', function() {
                        done();
                    });

                    modelThree.set({
                        first: 3,
                        second: 0
                    });
                });
            });


        it('does not report a collection as being dirty', function() {
            expect(collection.hasDirtyData()).to.be.false;
        });

        it('does not modify collection data when a model changes', function(done) {
            collection.prepare({ id: 3 }).then(function(modelFromWorker) {
                var modelData = modelFromWorker.toJSON();
                expect(modelData).to.have.property('first', 1);
                expect(modelData).to.have.property('second', 2);
                done();
            });
        });
    });
});
