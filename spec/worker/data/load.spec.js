'use strict';


var _ = require('underscore');
var when = require('when');

var mockConduitWorker = require('../mockConduitWorker');

var load = require('../../../src/worker/data/load');
var dataUtils = require('../../../src/worker/data/dataUtils');
var managedContext = require('../../../src/worker/managedContext');

var responseHeaders = {
    'Content-Type': 'application/json'
};

describe('The data/fetch module', function() {

    it('provides a method named "load"', function() {
        expect(load.name).to.equal('load');
    });

    describe('when requesting data', function() {
        var promise, requests, responseData;

        beforeEach(function() {
            var requestOpts = {
                url: '/foo',
                XMLHttpRequest: this.FakeXMLHttpRequest
            };
            requests = [];
            load.onRequestCreate(function(request) {
                requests.push(request);
            });
            responseData = this.getSampleData();

            mockConduitWorker.reset();
            var context = mockConduitWorker.bindModule(load);
            dataUtils.initStore({ reset: true });

            promise = context.load(requestOpts);
        });

        it('returns a promise', function() {
            expect(when.isPromiseLike(promise)).to.be.true;
        });

        it('requests the correct URL', function() {
            expect(requests[0]).to.have.property('url', '/foo');
        });

        it('requests the data asynchronously', function() {
            expect(requests[0]).to.have.property('async', true);
        });

        it('resolves once the data is available', function(done) {
            requests[0].respond(200, responseHeaders, JSON.stringify(responseData));

            promise.then(function() {
                var data = dataUtils.getData();
                expect(data).to.have.length(responseData.length);

                expect(data[0]).to.have.property('name', 'two');
                expect(data[1]).to.have.property('name', 'one');
                expect(data[2]).to.have.property('name', 'three');

                done();
            });
        });

        it('rejects the promise on error', function(done) {
            requests[0].respond(500, responseHeaders, '{ "code": 500, "message": "Server Error" }');
            promise.catch(function(err) {
                expect(err.code).to.equal(500);
                done();
            });
        });

        it('clears out data when "options.reset" is true');

        it('does not clear out data when "options.reset" is false');
    });

    describe('when requesting data with a transform', function() {
        var promise, requests, responseData;

        beforeEach(function() {
            var requestOpts = {
                url: '/foo',
                XMLHttpRequest: this.FakeXMLHttpRequest,
                postFetchTransform: {
                    method: 'addAllProperties'
                }
            };
            requests = [];
            load.onRequestCreate(function(request) {
                requests.push(request);
            });
            responseData = this.getSampleData();

            mockConduitWorker.reset();
            var context = mockConduitWorker.bindModule(load);
            dataUtils.initStore({ reset: true });

            // TODO:  this should be mocked out in a better way
            context.handlers['addAllProperties'] = function(rawData) {
                return _.map(rawData, function(item) {
                    item.sum = item.first + item.second;
                    return item;
                });
            };

            promise = context.load(requestOpts);
        });

        it('applies the transform', function() {
            requests[0].respond(200, responseHeaders, JSON.stringify(responseData));

            promise.then(function() {
                var data = dataUtils.getData();
                expect(data).to.have.length(responseData.length);

                expect(data[0]).to.have.property('sum', 2);
                expect(data[1]).to.have.property('sum', 1);
                expect(data[2]).to.have.property('sum', 3);
            });
        });
    });
});