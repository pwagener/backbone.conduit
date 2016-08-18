'use strict';

var _ = require('underscore');

var workerSetData = require('./../../../src/worker/data/setData');
var mockConduitWorker = require('../mockConduitWorker');
var getDataUtils = require('../../../src/worker/data/getDataUtils');

describe('The data/setData module', function() {
    var context;
    var dataUtils;
    beforeEach(function() {
        mockConduitWorker.reset();
        context = mockConduitWorker.bindModule(workerSetData);
        dataUtils = getDataUtils(mockConduitWorker.getCurrentObjectId());
    });

    it('provides the name as "setData"', function() {
        expect(workerSetData.name).to.equal('setData');
    });

    it('can accept data as an array', function() {
        context.setData({
            data: this.getSampleData()
        });

        expect(dataUtils.getData()).to.have.length(3);
        expect(dataUtils.getData()[2].name).to.equal('three');
    });
    
    it('will cache the data if a "cacheKey" is provided', function () {
        context.setData({
            cacheKey: 'some-cache-key',
            data: this.getSampleData()
        });
        expect(dataUtils.getData()).to.have.length(3);
        expect(dataUtils.getCachedData('some-cache-key')).to.have.length(3);
        expect(dataUtils.getCachedData('some-cache-key')[2].name).to.equal('three');
        context.setData({
            data: [{ id: 4, name: 'four' }]
        });
        expect(dataUtils.getData()).to.have.length(1);
        expect(dataUtils.getCachedData('some-cache-key')).to.have.length(3);
    });

    it('returns the length of the provided data', function() {
        var length = context.setData({
            data: this.getSampleData()
        });

        expect(length).to.equal(3);
    });

    it('can accept data as a JSON string', function() {
        context.setData({
            data: JSON.stringify(this.getSampleData())
        });

        expect(dataUtils.getData()).to.have.length(3);
        expect(dataUtils.getData()[1].name).to.equal('one');
    });

    it('errors if you don\'t provide data correctly', function() {
        var bound = _.bind(context.setData, context, {
            data: 5
        });
        expect(bound).to.throw(Error);
    });
});
