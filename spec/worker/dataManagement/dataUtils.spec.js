'use strict';

/**
 * Tests for the data utils
 */

var _ = require('underscore');

var mockConduitWorker = require('../mockConduitWorker');

var dataUtils = require('./../../../src/worker/dataManagement/dataUtils');

describe('The worker/dataUtils module', function() {
    var context, data;

    beforeEach(function() {
        mockConduitWorker.reset();
        context = mockConduitWorker.get();
        data = this.getSampleData();
    });

    it('initializes the context to have a "data" property', function() {
        dataUtils.initStore();
        expect(context.data).to.be.an('array');
    });

    it('will not recreate the data store by default', function() {
        context.data = [ { foo: "bar" }];
        dataUtils.initStore();
        expect(context.data).to.have.length(1);
    });

    it('will recreate the data store if explicitly requested', function() {
        context.data = [ { foo: "bar" } ];
        dataUtils.initStore({ reset: true });
        expect(context.data).to.have.length(0);
    });

    it('does not modify an array of data when parsing', function() {
        var result = dataUtils.parseData(data);
        expect(result).to.equal(data);
    });

    it('parses a JSON string of an array into an array', function() {
        var dataStr = JSON.stringify(data);
        var result = dataUtils.parseData(dataStr);
        expect(result).to.deep.equal(data);
    });

    it('errors when parsing JSON that is not an array', function() {
        var nonArrayStr = JSON.stringify({ foo: 'bar' });
        var bound = _.bind(dataUtils.parseData, dataUtils, nonArrayStr);
        expect(bound).to.throw(Error);
    });

    describe('after initializing and adding data', function() {
        beforeEach(function() {
            dataUtils.initStore();
            dataUtils.addTo(this.getSampleData());
        });

        it('contains the fresh data', function() {
            expect(context.data).to.have.length(3);
            expect(context.data[2]).to.have.property('name', 'three');
        });

        it('can add data to existing', function() {
            dataUtils.addTo([
                { id: 10, name: "ten", first: 6, second: 4 }
            ]);

            expect(context.data).to.have.length(4);
            expect(context.data[3]).have.property('name', 'ten');
        });

        it('can merge data with existing', function() {
            dataUtils.addTo([
                { id: 3, name: "THREE" }
            ]);
            expect(context.data).to.have.length(3);
            expect(context.data[2]).to.have.property('name', 'THREE');
        });

        it('sets "_dataIndex" property to initial data correctly', function() {
            for (var i = 0; i < context.data.length; i++) {
                var current = context.data[i];
                expect(current._dataIndex).to.equal(i);
            }
        });

        it('sets "_dataIndex" property to added data properly', function() {
            dataUtils.addTo([
                { id: 10, name: "ten", first: 6, second: 4 }
            ]);
            for (var i = 0; i < context.data.length; i++) {
                var current = context.data[i];
                expect(current._dataIndex).to.equal(i);
            }
        });

        it('does not disturb the "_dataIndex" property of merged data', function() {
            dataUtils.addTo([
                { id: 3, name: "THREE" }
            ]);
            for (var i = 0; i < context.data.length; i++) {
                var current = context.data[i];
                expect(current._dataIndex).to.equal(i);
            }
        });
    });
});