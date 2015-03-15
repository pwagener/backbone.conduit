'use strict';

var _ = require('underscore');
var when = require('when');

var Boss = require('./../src/Boss');

/**
 * Method to create a Worker constructor that is mocked out for testing the Boss.
 * These unit tests can then run via Node instead of in a browser.
 * @param sinon The sinon instance to use for mocking
 * @param data The response the worker should provide asynchronously
 * from any "postMessage" call.
 * @return {Function} The mocked-out Worker constructor
 */
function makeMockWorker(sinon, data) {
    //noinspection UnnecessaryLocalVariableJS
    var MockWorker = function() {
        // Spy on our "postMessage" impl
        sinon.spy(this, 'postMessage');
    };

    MockWorker.prototype.postMessage = function() {
        var self = this;
        _.delay(function() {
            self.onmessage({
                data: data
            });
        }, 10);
    };

    MockWorker.prototype.terminate = sinon.spy();

    return MockWorker;
}


describe('The Boss module', function() {

    it('provides a constructor', function() {
        expect(Boss).to.be.a('function');
    });

    describe('when instantiated', function() {
        var boss, responseData;

        beforeEach(function() {
            responseData = { bar: "baz" };
            boss = new Boss({
                Worker: makeMockWorker(this.sinon, responseData),
                fileLocation: '/fake/location'
            });
        });

        it('starts without an associated worker', function() {
            //noinspection BadExpressionStatementJS
            expect(boss.worker).to.be.undefined;
        });

        it('requires a named "method" to create a promise', function() {
            var bound = _.bind(boss.promise, boss, { foo: "bar" });
            expect(bound).to.throw(Error);
        });

        it('creates a promise when one is requested', function() {
            var promise = boss.promise({
                method: 'foo'
            });

            //noinspection BadExpressionStatementJS
            expect(when.isPromiseLike(promise)).to.be.true;
        });

        it('has an associated worker once the promise is created', function() {
            var promise = boss.promise({
                method: 'foo'
            });

            expect(boss.worker).to.be.an('object');
        });

        it('posts a message to the worker', function(done) {
            var promise = boss.promise({
                method: 'foo'
            });

            promise.then(function(response) {
                //noinspection BadExpressionStatementJS
                expect(boss.worker.postMessage.called).to.be.true;
                done();
            });
        });

        it('resolves the promise with the data from the worker', function(done) {
            boss.promise({
                method: 'foo'
            }).then(function(response) {
                expect(response).to.equal(responseData);
                done();
            });
        });
    });

});