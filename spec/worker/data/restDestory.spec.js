'use strict';

/**
 * Tests for the 'destroy' functionality, which is the REST-ful 'DELETE' call.
 */
var _ = require('underscore');

var restTestUtil = require('./restTestUtil');

var destroyModule = require('./../../../src/worker/data/restDestroy');
var dataUtils = require('../../../src/worker/data/dataUtils');


describe('The rest/destroy module', function() {
    var testUtil, promise;

    beforeEach(function() {
        testUtil = restTestUtil.setup({
            initialData: this.getSampleData(),
            moduleToBind: destroyModule
        });

        promise = testUtil.context.restDestroy({ id: 3 }, { baseUrl: '/foo' });
    });

    it('provides a method named "restDestroy"', function () {
        expect(destroyModule.name).to.equal('restDestroy');
    });

    it('issues one DELETE', function() {
        expect(testUtil.requests).to.have.length(1);
        expect(testUtil.requests[0]).to.have.property('method', 'DELETE');
    });

    it('resolves the promise on success', function(done) {
        promise.then(function() {
            done();
        });

        testUtil.respond();
    });

    it('resolves the promise with whatever the server response was', function(done) {
        var response = { id: 3 };
        promise.then(function(result) {
            expect(result).to.eql(response);
            done();
        });

        testUtil.respond({ data: response });
    });

    it('removes the data on success', function(done) {
        promise.then(function() {
            var data = dataUtils.getData();
            expect(data).to.have.length(2);
            expect(_.findWhere(data, { id: 3 })).to.be.undefined;
            done();
        });

        testUtil.respond();
    });

    it('rejects the promise on server error', function(done) {
        promise.catch(function() {
            done();
        });

        testUtil.respond({
            code: 500,
            message: 'Server Error!'
        });
    });

    it('does not remove the data on failure', function(done) {
        promise.catch(function() {
            var data = dataUtils.getData();
            expect(data).to.have.length(3);
            expect(_.findWhere(data, { id: 3 })).to.have.property('name', 'three');
            done();
        });

        testUtil.respond({
            code: 500,
            message: 'Server Error!'
        });
    });

    it('rejects the promise if an ID is not provided', function(done) {
        testUtil.context.restDestroy( { name: 'three' }).catch(function() {
            done();
        });
    });
});