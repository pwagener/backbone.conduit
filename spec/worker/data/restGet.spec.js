'use strict';

/**
 * Tests for the 'get' functionality
 */

var _ = require('underscore');

var restTestUtil = require('./restTestUtil');

var getModule = require('../../../src/worker/data/restGet');
var dataUtils = require('../../../src/worker/data/dataUtils');

describe('The rest/get module', function() {
    var testUtil, promise;

    it('provides a method named "restGet"', function () {
        expect(getModule.name).to.equal('restGet');
    });

    describe('when requesting data', function () {

        beforeEach(function () {
            testUtil = restTestUtil.setup({
                initialData: [{ id: 5, name: 'five', first: 2, second: 3 }],
                moduleToBind: getModule,
                dataToRespond: this.getSampleData()
            });

            promise = testUtil.context.restGet({
                url: '/foo',
                headers: {
                    'X-is-a-custom': true
                }
            });
        });

        it('returns a promise', function () {
            expect(promise.then).to.be.a('function');
        });

        it('made one request', function () {
            expect(testUtil.requests).to.have.length(1);
            expect(testUtil.requests[0]).to.have.property('method', 'GET');

        });

        it('requests the correct URL', function () {
            expect(testUtil.requests[0]).to.have.property('url', '/foo');
        });

        it('requests the data asynchronously', function () {
            expect(testUtil.requests[0]).to.have.property('async', true);
        });

        it('requests with a default value for "Accept" header', function() {
            expect(testUtil.requests[0].requestHeaders).to.have.property('Accept');
        });

        it('can provide extra headers', function() {
            expect(testUtil.requests[0].requestHeaders).to.have.property('X-is-a-custom', true);
        });

        it('resolves once the data is available', function (done) {
            promise.then(function () {
                done();
            });

            testUtil.respond();
        });

        it('does not clear out data by default', function(done) {
            promise.then(function () {
                var data = dataUtils.getData();
                expect(data).to.have.length(4);
                expect(_.findWhere(data, { id: 2 })).to.have.property('name', 'two');
                expect(_.findWhere(data, { id: 1 })).to.have.property('name', 'one');
                expect(_.findWhere(data, { id: 3 })).to.have.property('name', 'three');
                expect(_.findWhere(data, { id: 5 })).to.have.property('name', 'five');

                done();
            });

            testUtil.respond();
        });

        it('rejects the promise on error', function (done) {
            promise.catch(function (err) {
                expect(err.code).to.equal(500);
                done();
            });

            testUtil.respond({
                code: 500,
                data: JSON.stringify({ code: 500, message: 'Server Error' })
            });
        });
    });

    describe('when requesting data with reset', function () {

        beforeEach(function() {
            // Set it up with one entry in the data
            testUtil = restTestUtil.setup({
                initialData: [{ id: 5, name: 'five', first: 2, second: 3 }],
                moduleToBind: getModule,
                dataToRespond: this.getSampleData()
            });

            // Request a reset
            promise = testUtil.context.restGet({ url: '/foo', reset: true });
        });

        it('clears out data', function(done) {
            expect(dataUtils.length()).to.equal(1);
            promise.then(function() {
                var data = dataUtils.getData();
                expect(data).to.have.length(3);
                expect(_.findWhere(data, { id: 5 })).to.be.undefined;

                done();
            });

            testUtil.respond();
        });
    });

    describe('when requesting data with a transform', function() {
        beforeEach(function() {
            testUtil = restTestUtil.setup({
                moduleToBind: getModule,
                dataToRespond: this.getSampleData()
            });

            // TODO:  this should be mocked out in a better way
            testUtil.context.handlers['calculateSums'] = function(rawData) {
                return _.map(rawData, function(item) {
                    item.sum = item.first + item.second;
                    return item;
                });
            };
        });

        it('applies the transform method', function(done) {
            testUtil.context.restGet({
                url: '/foo',
                postFetchTransform: {
                    method: 'calculateSums'
                }
            }).then(function() {
                var data = dataUtils.getData();
                expect(data).to.have.length(3);

                expect(data[0]).to.have.property('sum', 2);
                expect(data[1]).to.have.property('sum', 1);
                expect(data[2]).to.have.property('sum', 3);
                done();
            });

            testUtil.respond();
        });

        it('resolves the transform with the resulting context', function(done) {
            testUtil.context.restGet({
                url: '/foo',
                postFetchTransform: {
                    method: 'calculateSums',
                    context: { foo: 'bar' }
                }
            }).then(function(result) {
                expect(result).to.have.property('context');
                expect(result.context).to.have.property('foo', 'bar');
                done();
            });

            testUtil.respond();
        });

        it('extracts data via "useAsData"', function(done) {
            testUtil = restTestUtil.setup({
                moduleToBind: getModule,
                dataToRespond: {
                    theData: this.getSampleData()
                }
            });

            testUtil.context.restGet({
                url: '/foo',
                postFetchTransform: { useAsData: 'theData' }
            }).then(function(result) {
                expect(result).to.not.have.property('context');

                var data = dataUtils.getData();
                expect(data).to.have.length(3);

                done();
            });

            testUtil.respond();
        });
    });
});