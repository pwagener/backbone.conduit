'use strict';

/**
 * Exercise the resetProjection worker method
 */
var _ = require('underscore');
var mockConduitWorker = require('../mockConduitWorker');
var dataUtils = require('../../../src/worker/data/dataUtils');
var managedContext = require('../../../src/worker/managedContext');

var resetProjection = require('../../../src/worker/data/resetProjection');


describe('The data/resetProjection module', function() {

    it('provices a method named "resetProjection"', function() {
        expect(resetProjection.name).to.equal('resetProjection');
    });

    describe('when a projection is applied', function() {
        var context, sampleData;

        beforeEach(function() {
            mockConduitWorker.reset();
            context = mockConduitWorker.bindModule(resetProjection);
            dataUtils.initStore();
            sampleData = this.getSampleData();
            dataUtils.addTo(sampleData);

            // Apply a filtering projection to the data
            dataUtils.applyProjection(function(data) {
                return _.filter(data, function (item) {
                    return item.name[0] === 't';
                });
            });

            expect(dataUtils.length()).to.equal(2);
            context.resetProjection();
        });

        it('can reset the projection', function() {
            var data = dataUtils.getData();
            expect(data).to.have.length(3);
        });

        it('resets to the original data', function() {
            var data = dataUtils.getData();
            expect(data).to.eql(sampleData);
        })
    });
});