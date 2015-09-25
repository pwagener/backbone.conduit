'use strict';

/**
 * Exercise the data map method
 */

var _ = require('underscore');
var mockConduitWorker = require('../mockConduitWorker');
var dataUtils = require('../../../src/worker/data/dataUtils');
var managedContext = require('../../../src/worker/managedContext');

var map = require('../../../src/worker/data/map');

describe('The data/map module', function() {

    it('provides a method named "map"', function() {
        expect(map.name).to.equal('map');
    });

    describe('when data is available', function() {
        var context;

        beforeEach(function() {
            mockConduitWorker.reset();
            context = mockConduitWorker.bindModule(map);

            // This test component provides a function that will add 'item.first' to 'item.second' and produce
            // a new object with the same ID and a 'total' field.
            context.registerComponent({
                name: 'testComponent',
                methods: [
                {
                    name: 'computeThirdField',
                    method: function(item) {
                        return {
                            id: item.id,
                            total: item.first + item.second
                        };
                    }
                }, {
                    name: 'countNumberEvenTotal',
                    method: function(item) {
                        if (_.isUndefined(this.evenTotal)) {
                            this.evenTotal = 0;
                        }

                        if (item.total % 2 === 0) {
                            this.evenTotal++;
                        }
                    }
                }]
            });

            dataUtils.initStore({ reset: true });
            dataUtils.addTo(this.getSampleData());

            context.map({
                mapper: 'computeThirdField'
            });
        });

        it('maps data to different data', function() {
            var data = dataUtils.getData();
            expect(data).to.have.length(3);

            expect(data[0]).to.have.property('total', 2);
            expect(data[1]).to.have.property('total', 1);
            expect(data[2]).to.have.property('total', 3);
        });

        it('gets reset like any other projection', function() {
            dataUtils.resetProjection();
            var data = dataUtils.getData();

            expect(data).to.have.length(3);
            expect(data[0]).to.have.property('name', 'two');
            expect(data[1]).to.have.property('name', 'one');
            expect(data[2]).to.have.property('name', 'three');
        });

        it('can accept a context', function() {
            var mapContext = {};
            var result = context.map({
                mapper: 'countNumberEvenTotal',
                context: mapContext
            });

            expect(result.context).to.have.property('evenTotal', 1);
        });
    });
});