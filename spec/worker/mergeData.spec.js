'use strict';

/**
 * Tests for the mergeData worker module
 */

var _ = require('underscore');

var workerMergeData = require('./../../src/worker/mergeData');

describe('The worker/mergeData module', function() {
    var context;

    beforeEach(function() {
        context = {};
        context.mergeData = _.bind(workerMergeData.method, context)
    });

    it('provides the name as "mergeData"', function() {
        expect(workerMergeData.name).to.equal('mergeData');
    });

    it('can add data when none exists', function() {
        var length = context.mergeData({
            data: this.getSampleData()
        });

        expect(length).to.equal(3);
        expect(context.data[1].name).to.equal('one');
    });

    describe('when data is added initially', function() {
        beforeEach(function() {
            var length = context.mergeData({
                data: this.getSampleData()
            });

            expect(length).to.equal(3);
        });

        it('contains the data', function() {
            expect(context.data[1]).to.have.property('name', 'one');
        });

        it('can merge more data by "id"', function() {
            var length = context.mergeData({
                data: [
                    { id: 3, name: 'THREE'},
                    { id: 10, name: 'ten' }
                ]
            });

            expect(length).to.equal(4);
            expect(context.data[2]).to.have.property('name', 'THREE');
        });

        it('can merge in nothing', function() {
            var length = context.mergeData();

            expect(length).to.equal(3);
            expect(context.data[2]).to.have.property('name', 'three');
        });

    });

    describe('when the data is added with an idKey', function() {
        beforeEach(function() {
            var length = context.mergeData({
                data: this.getSampleData(),
                idKey: 'name'
            });

            expect(length).to.equal(3);
        });

        it('merges data by the alternative ID property', function() {
            var length = context.mergeData({
                data: [
                    { name: 'two', alt: 'duo'}
                ]
            });

            expect(length).to.equal(3);
            expect(context.data[0]).to.have.property('alt', 'duo');
        });
    });
});