'use strict';

var _ = require('underscore');
var mockConduitWorker = require('../mockConduitWorker');

var workerSort = require('./../../../src/worker/data/sortBy');
var dataUtils = require('../../../src/worker/data/dataUtils');

describe("The data/sortBy module", function() {
    it('provides the name as "sortBy"', function() {
        expect(workerSort.name).to.equal("sortBy");
    });

    describe('when data is available', function() {
        var context, boundSort;
        beforeEach(function() {
            mockConduitWorker.reset();
            context = mockConduitWorker.get();
            boundSort = _.bind(workerSort.method, context);

            dataUtils.initStore({ reset: true });
            dataUtils.addTo(this.getSampleData());
        });

        it('sorts by property ascending', function() {
            boundSort({
                comparator: 'name'
            });

            var data = dataUtils.getData();
            expect(data[1]).to.have.property('name', 'three');
        });

        it('sorts by a property descending when requested', function() {
            boundSort({
                comparator: 'name',
                direction: 'desc'
            });

            var data = dataUtils.getData();
            expect(data[2]).to.have.property('name', 'one');
        });

        // TODO: test for a function comparator
    });
});