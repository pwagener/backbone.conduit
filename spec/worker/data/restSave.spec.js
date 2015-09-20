'use strict';

/**
 * Tests for the 'save' functionality
 */

var _ = require('underscore');
var when = require('when');

var restTestUtil = require('./restTestUtil');

var saveModule = require('../../../src/worker/data/restSave');
var dataUtils = require('../../../src/worker/data/dataUtils');


describe('The rest/save module', function() {
    var testUtil, requestData, promise;

    it('provides a method named "restSave"', function () {
        expect(saveModule.name).to.equal('restSave');
    });

    describe('when saving data without an ID', function() {

        beforeEach(function() {
            testUtil = restTestUtil.setup({
                initialData: this.getSampleData(),
                moduleToBind: saveModule,
                dataToRespond: { id: 5, name: 'five', first: 3, second: 2 }
            });

            requestData = { name: 'five', first: 3, second: 2 };
            promise = testUtil.context.restSave(requestData, { rootUrl: '/foo' });
        });

        it('issues one POST', function() {
            expect(testUtil.requests).to.have.length(1);
            expect(testUtil.requests[0]).to.have.property('method', 'POST');
        });

        it('contains the right data in the POST', function() {
            var data = testUtil.requests[0].requestBody;
            expect(data).to.equal(JSON.stringify(requestData));
        });

        it('resolves a success', function(done) {
            promise.then(function() {
                done();
            });

            testUtil.respond();
        });

        it('adds the data on success', function(done) {
            var data = dataUtils.getData();
            expect(data).to.have.length(3);

            promise.then(function() {
                data = dataUtils.getData();
                expect(data).to.have.length(4);
                var newItem = _.findWhere(data, { id: 5 });
                expect(newItem).to.have.property('name', 'five');
                done();
            });

            testUtil.respond();
        });

        it('rejects a failure', function(done) {
            promise.catch(function(err) {
                expect(err.code).to.equal(500);
                done();
            });

            testUtil.respond({ code: 500, message: 'Things are broken' });
        });

        it('does not add the data on failure', function(done) {
            var data = dataUtils.getData();
            expect(data).to.have.length(3);

            promise.catch(function() {
                data = dataUtils.getData();
                expect(data).to.have.length(3);
                done();
            });

            testUtil.respond({ code: 500, message: 'Better not add this!' });
        });

    });

    describe('when saving data with an ID', function() {

        beforeEach(function() {
            testUtil = restTestUtil.setup({
                initialData: this.getSampleData(),
                moduleToBind: saveModule,
                dataToRespond: { id: 3, name: 'five', first: 0, second: 3 }
            });

            requestData = { id: 3, name: 'three', first: 1, second: 2};
            promise = testUtil.context.restSave(requestData, { rootUrl: '/foo' });
        });


        it('issues one PUT', function() {
            expect(testUtil.requests).to.have.length(1);
            expect(testUtil.requests[0]).to.have.property('method', 'PUT');
        });

        it('contains the right data in the PUT', function() {
            var data = testUtil.requests[0].requestBody;
            expect(data).to.equal(JSON.stringify(requestData));
        });

        it('uses the right URL for the PUT', function() {
            var url = testUtil.requests[0].url;
            expect(url).to.equal('/foo/3');
        });

        it('resolves a success', function(done) {
            promise.then(function() {
                done();
            });

            testUtil.respond();
        });

        it('updates the data on success', function(done) {
            promise.then(function() {
                var data = dataUtils.getData();
                var modified = _.findWhere(data, { id: 3 });
                expect(modified).to.have.property('first', 0);
                expect(modified).to.have.property('second', 3);
                done();
            });

            testUtil.respond();
        });


        it('rejects a failure', function(done) {
            promise.catch(function() {
                done();
            });

            testUtil.respond({
                code: 400,
                data: JSON.stringify({ code: 400, message: 'Bad Request' })
            });
        });

        it('does not update the data on failure', function(done) {
            promise.catch(function() {
                var data = dataUtils.getData();
                expect(data).to.have.length(3);

                var unmodified = _.findWhere(data, { id: 3 });
                expect(unmodified).to.have.property('first', 1);
                expect(unmodified).to.have.property('second', 2);

                done();
            });

            testUtil.respond({
                code: 400,
                data: JSON.stringify({ code: 400, message: 'Bad Request' })
            });
        });

    });

});
