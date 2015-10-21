'use strict';

/**
 * Tests for the data utils
 */

var _ = require('underscore');

var mockConduitWorker = require('../mockConduitWorker');
var managedContext = require('../../../src/worker/managedContext');

var dataUtils = require('./../../../src/worker/data/dataUtils');

describe('The worker/dataUtils module', function() {
    var context;

    beforeEach(function() {
        mockConduitWorker.reset();
        context = mockConduitWorker.get();
    });

    it('initializes the context to have an empty data', function() {
        dataUtils.initStore();
        var initial = dataUtils.getData();
        expect(initial).to.be.an('array');
    });

    it('always recreates the data store on "initStore"', function() {
        dataUtils.initStore();
        var initial = dataUtils.getData();

        dataUtils.initStore();
        expect(initial).to.not.equal(dataUtils.getData());
    });

    it('does not modify an array of data when parsing', function() {
        var sampleData = this.getSampleData();
        var result = dataUtils.parseData(sampleData);
        expect(result).to.equal(sampleData);
    });

    it('parses a JSON string of an array into an array', function() {
        var sampleData = this.getSampleData();
        var dataStr = JSON.stringify(sampleData);
        var result = dataUtils.parseData(dataStr);
        expect(result).to.deep.equal(sampleData);
    });

    it('errors when parsing JSON that is not an array', function() {
        var nonArrayStr = JSON.stringify({ foo: 'bar' });
        var bound = _.bind(dataUtils.parseData, dataUtils, nonArrayStr);
        expect(bound).to.throw(Error);
    });

    describe('after initializing and adding data', function() {
        var storedData;
        beforeEach(function() {
            dataUtils.initStore();
            dataUtils.addTo(this.getSampleData());
            storedData = dataUtils.getData();
        });

        it('contains the fresh data', function() {
            expect(storedData).to.have.length(3);
            expect(storedData[0]).to.have.property('name', 'two');
            expect(storedData[1]).to.have.property('name', 'one');
            expect(storedData[2]).to.have.property('name', 'three');
        });

        it('fetches data by ID', function() {
            expect(dataUtils.findById(1)).to.have.property('name', 'one');
            expect(dataUtils.findById(2)).to.have.property('name', 'two');
            expect(dataUtils.findById(3)).to.have.property('name', 'three');
        });

        it('can add data to existing', function() {
            dataUtils.addTo([
                { id: 10, name: "ten", first: 6, second: 4 }
            ]);

            var result = dataUtils.getData();
            expect(result).to.have.length(4);
            expect(result[3]).have.property('name', 'ten');
        });

        it('can add null to existing', function() {
            dataUtils.addTo([
                null
            ]);

            var result = dataUtils.getData();
            expect(result).to.have.length(4);
            expect(result[3]).to.equal(null);
        });

        it('can merge data with existing', function() {
            dataUtils.addTo([
                { id: 3, name: "THREE" }
            ]);

            var result = dataUtils.getData();
            expect(result).to.have.length(3);
            expect(result[2]).to.have.property('name', 'THREE');
        });

        it('can merge data by replacing', function() {
            dataUtils.addTo([
                { id: 3, name: 'three', first: 3 }
            ], {
                replace: true
            });

            storedData = dataUtils.getData();
            expect(storedData).to.have.length(3);

            var modified = storedData[2];
            expect(modified).to.have.property('name', 'three');
            expect(modified).to.not.have.property('second');
        });

        it('sets "_dataIndex" property to initial data correctly', function() {
            for (var i = 0; i < storedData.length; i++) {
                var current = storedData[i];
                expect(current._dataIndex).to.equal(i);
            }
        });

        it('sets "_dataIndex" property to added data properly', function() {
            dataUtils.addTo([
                { id: 10, name: "ten", first: 6, second: 4 }
            ]);

            var result = dataUtils.getData();
            for (var i = 0; i < result.length; i++) {
                var current = result[i];
                expect(current._dataIndex).to.equal(i);
            }
        });

        it('does not disturb the "_dataIndex" property of merged data', function() {
            dataUtils.addTo([
                { id: 3, name: "THREE" }
            ]);

            var result = dataUtils.getData();
            for (var i = 0; i < result.length; i++) {
                var current = result[i];
                expect(current._dataIndex).to.equal(i);
            }
        });

        it('begins its life with its projected data equaling initial data', function() {
            var projected = dataUtils.getData();
            expect(projected).to.equal(storedData);
        });

        it('does not generate IDs', function() {
            var result = dataUtils.getData();

            expect(result[0]).to.not.have.property('_conduitId');
            expect(result[1]).to.not.have.property('_conduitId');
            expect(result[2]).to.not.have.property('_conduitId');
        })
    });

    describe('when one projection has been applied', function() {
        var projectionSpy, storedData;
        beforeEach(function() {
            var nameMustStartWithT = function(data) {
                return _.filter(data, function(item) {
                    return item.name[0] == 't';
                });
            };
            projectionSpy = this.sinon.spy(nameMustStartWithT);

            dataUtils.initStore();
            dataUtils.addTo(this.getSampleData());
            dataUtils.applyProjection(projectionSpy);
            storedData = dataUtils.getData();
        });

        it('returns projected data', function() {
            expect(storedData).to.have.length(2);
            expect(storedData[0]).to.have.property('name', 'two');
            expect(storedData[1]).to.have.property('name', 'three');
        });

        it('fetches projected items by ID', function() {
            expect(dataUtils.findById(2)).to.have.property('name', 'two');
            expect(dataUtils.findById(3)).to.have.property('name', 'three');
        });

        it('does not fetch non-projected items by ID', function() {
            expect(dataUtils.findById(1)).to.be.undefined;
        });

        it('reapplies the projection when data is added', function() {
            expect(projectionSpy.callCount).to.equal(1);
            dataUtils.addTo([
                { id: 4, name: 'four', first: 2, second: 2 },
                { id: 12, name: 'twelve', first: 10, second: 2 }
            ]);

            expect(projectionSpy.callCount).to.equal(2);
            var result = dataUtils.getData();
            expect(result).to.have.length(3);
            expect(result[2]).to.have.property('name', 'twelve');
        });

        it('resets the data back to the original', function() {
            dataUtils.resetProjection();
            storedData = dataUtils.getData();
            expect(storedData).to.have.length(3);
        });

        it('does not apply projections after resetting them', function() {
            dataUtils.resetProjection();
            dataUtils.addTo([
                { id: 4, name: 'four', first: 2, second: 2 }
            ]);

            expect(projectionSpy.callCount).to.equal(1);
        });

        it('contains all added data after a reset', function() {
            dataUtils.addTo([
                { id: 4, name: 'four', first: 2, second: 2 },
                { id: 12, name: 'twelve', first: 10, second: 2 }
            ]);
            dataUtils.resetProjection();

            var result = dataUtils.getData();
            expect(result).to.have.length(5);
        });

        it('applies projections in sequence', function() {
            expect(projectionSpy.callCount).to.equal(1);

            var mustEndWithE = function(data) {
                return _.filter(data, function(item) {
                    return item.name[item.name.length - 1] == 'e';
                });
            };
            var secondProjectionSpy = this.sinon.spy(mustEndWithE);
            dataUtils.applyProjection(secondProjectionSpy);

            var result = dataUtils.getData();
            expect(result).to.have.length(1);
            expect(result[0]).to.have.property('name', 'three');

            expect(projectionSpy.callCount).to.equal(1);
            expect(secondProjectionSpy.callCount).to.equal(1);
        });
    });

    describe('when initialized to generate IDs', function() {

        beforeEach(function() {
            mockConduitWorker.reset();
            context = mockConduitWorker.get();

            managedContext.configure({
                generateIds: true
            });

            dataUtils.initStore();
        });

        it('adds "_conduitId" to any new data', function() {
            dataUtils.addTo(this.getSampleData());

            var result = dataUtils.getData();
            expect(result[0]).to.have.property('_conduitId');
            expect(result[1]).to.have.property('_conduitId');
            expect(result[2]).to.have.property('_conduitId');
        });

        it('does not change "_conduitId" when object is replaced', function() {
            dataUtils.addTo(this.getSampleData());

            // Sanity check
            var results = dataUtils.getData();
            var itemTwo = results[0];
            expect(itemTwo).to.have.property('_conduitId');
            expect(itemTwo).to.have.property('name', 'two');

            var origConduitId = itemTwo._conduitId;

            // Update the data
            dataUtils.addTo([{
                id: 2,
                name: 'two',
                first: 2
            }], { replace: true });

            results = dataUtils.getData();
            itemTwo = results[0];
            expect(itemTwo).to.have.property('name', 'two');

            // Must have the same ConduitID
            expect(itemTwo).to.have.property('_conduitId', origConduitId);
        });
    });
});