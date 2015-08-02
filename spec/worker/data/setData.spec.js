'use strict';

var _ = require('underscore');

var workerSetData = require('./../../../src/worker/data/setData');
var mockConduitWorker = require('../mockConduitWorker');

describe('The data/setData module', function() {
    var context;
    beforeEach(function() {
        mockConduitWorker.reset();
        context = mockConduitWorker.get();
        context.setData = _.bind(workerSetData.method, context)
    });

    it('provides the name as "setData"', function() {
        expect(workerSetData.name).to.equal('setData');
    });

    it('can accept data as an array', function() {
        context.setData({
            data: this.getSampleData()
        });

        expect(context._data).to.have.length(3);
        expect(context._data[2].name).to.equal('three');
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

        expect(context._data).to.have.length(3);
        expect(context._data[1].name).to.equal('one');
    });

    it('errors if you don\'t provide data correctly', function() {
        var bound = _.bind(context.setData, context, {
            data: 5
        });
        expect(bound).to.throw(Error);
    });
});