'use strict';

var _ = require('underscore');
var mockConduitWorker = require('../mockConduitWorker');
var dataUtils = require('../../../src/worker/data/dataUtils');

var workerPrepare = require('./../../../src/worker/data/prepare');

describe('The data/prepare module', function() {

    it('provides the name as "prepare"', function() {
        expect(workerPrepare.name).to.equal('prepare');
    });

    describe('when data is available added', function() {
        var context;

        beforeEach(function() {
            mockConduitWorker.reset();
            dataUtils.initStore({ reset: true });
            dataUtils.addTo(this.getSampleData());

            context = mockConduitWorker.get();

            context.prepare = _.bind(workerPrepare.method, context)
        });

        it('can return a model by ID', function() {
            var result = context.prepare({ id: 2 });
            expect(result).to.be.an('object');
            expect(result.id).to.equal(2);
            expect(result.name).to.equal('two');
        });

        it('can return multiple models by ID', function() {
            var result = context.prepare({ ids: [3, 2]});
            expect(result).to.be.instanceof(Array);
            expect(result).to.have.length(2);
            expect(result[0].name).to.equal('three');
            expect(result[1].name).to.equal('two');
        });

        it('can return a model by index', function() {
            var result = context.prepare({ index: 2});
            expect(result).to.be.a('object');
            expect(result).to.have.property('name', 'three');
        });

        it('can return models from an index range', function() {
            var result = context.prepare({
                indexes: {
                    min: 1,
                    max: 2
                }
            });

            expect(result).to.be.instanceOf(Array);
            expect(result[0]).to.have.property('name', 'one');
            expect(result[1]).to.have.property('name', 'three');
        });
    });
});