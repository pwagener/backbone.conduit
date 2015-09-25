'use strict';

/**
 * Tests for the mergeData worker module
 */
var _ = require('underscore');

var mockConduitWorker = require('../mockConduitWorker');
var dataUtils = require('../../../src/worker/data/dataUtils');

var workerMergeData = require('./../../../src/worker/data/mergeData');

describe('The data/mergeData module', function() {
    var context;

    beforeEach(function() {
        mockConduitWorker.reset();
        context = mockConduitWorker.bindModule(workerMergeData);
    });

    it('provides the name as "mergeData"', function() {
        expect(workerMergeData.name).to.equal('mergeData');
    });

    it('can add data when none exists', function() {
        var length = context.mergeData({
            data: this.getSampleData()
        });

        expect(length).to.equal(3);
        var data = dataUtils.getData();
        expect(data[1].name).to.equal('one');
    });

    describe('when data is added initially', function() {
        var data;
        beforeEach(function() {
            dataUtils.initStore({ reset: true });
            context = mockConduitWorker.bindModule(workerMergeData);

            var length = context.mergeData({
                data: this.getSampleData()
            });

            expect(length).to.equal(3);
            data = dataUtils.getData();
        });

        it('contains the data', function() {
            expect(data[1]).to.have.property('name', 'one');
        });

        it('can merge more data by "id"', function() {
            var length = context.mergeData({
                data: [
                    { id: 3, name: 'THREE'},
                    { id: 10, name: 'ten' }
                ]
            });

            expect(length).to.equal(4);
            data = dataUtils.getData();
            expect(data[2]).to.have.property('name', 'THREE');
        });

        it('can merge in nothing', function() {
            var length = context.mergeData();
            expect(length).to.equal(3);
            data = dataUtils.getData();
            expect(data[2]).to.have.property('name', 'three');
        });

        it('can replace data', function() {
            context.mergeData({
                data: [
                    { id: 1, name: 'one', first: 1 }
                ],
                options: { replace: true }
            });
            data = dataUtils.getData();
            var changed = _.findWhere(data, { id: 1 });
            expect(changed).to.have.property('name', 'one');
            expect(changed).to.not.have.property('second');
        });
    });

    describe('when the data is added with an idKey', function() {
        var data;
        beforeEach(function() {
            dataUtils.initStore({
                reset: true,
                idKey: 'name'
            });
            var length = context.mergeData({
                data: this.getSampleData()
            });

            expect(length).to.equal(3);
            data = dataUtils.getData();
        });

        it('merges data by the alternative ID property', function() {
            var length = context.mergeData({
                data: [
                    { name: 'two', alt: 'duo'}
                ]
            });

            expect(length).to.equal(3);
            data = dataUtils.getData();
            expect(data[0]).to.have.property('alt', 'duo');
        });
    });
});