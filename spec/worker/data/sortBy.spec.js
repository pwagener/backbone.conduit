'use strict';

var _ = require('underscore');
var mockConduitWorker = require('../mockConduitWorker');

var workerSort = require('./../../../src/worker/data/sortBy');
var getDataUtils = require('../../../src/worker/data/getDataUtils');

describe("The data/sortBy module", function() {
    it('provides the name as "sortBy"', function() {
        expect(workerSort.name).to.equal("sortBy");
    });

    describe('when data is available', function() {
        var context;
        var dataUtils;
        beforeEach(function() {
            mockConduitWorker.reset();
            dataUtils = getDataUtils(mockConduitWorker.getCurrentObjectId());
            context = mockConduitWorker.bindModule(workerSort);

            dataUtils.initStore({ reset: true });
            dataUtils.addTo(this.getSampleData());
        });

        it('sorts by property ascending', function() {
            context.sortBy({
                property: 'name'
            });

            var data = dataUtils.getData();
            expect(data[1]).to.have.property('name', 'three');
        });

        it('sorts by a property descending when requested', function() {
            context.sortBy({
                property: 'name',
                direction: 'desc'
            });

            var data = dataUtils.getData();
            expect(data[2]).to.have.property('name', 'one');
        });

        it('sorts by a provided function', function() {
            context.registerComponent({
                name: 'testComponent',
                methods:[{
                    name: 'byId',
                    method: function(item) {
                        return item.id;
                    }
                }]
            });

            context.sortBy({
                method: 'byId'
            });
            var data = dataUtils.getData();
            var ids = _.pluck(data, 'id');

            expect(ids).to.eql([1, 2, 3]);
        });

        it('can accept & return a context', function() {
            context.registerComponent({
                name: 'testComponent',
                methods:[{
                    name: 'byIdWithCount',
                    method: function(item) {
                        if (_.isUndefined(this.sortCount)) {
                            this.sortCount = 0;
                        }
                        this.sortCount++;

                        return item.id;
                    }
                }]
            });

            var sortContext = {};
            var result = context.sortBy({
                method: 'byIdWithCount',
                context: sortContext
            });

            expect(result.context).to.have.property('sortCount', 3);
        });

    });
});
