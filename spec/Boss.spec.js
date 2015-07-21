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

    it('requires a "fileLocation" option', function(done) {
        try {
            new Boss({
                Worker: makeMockWorker(this.sinon, { })
            });
        } catch (err) {
            expect(err).to.be.instanceOf(Error);
            done();
        }
    });

    it('requires a "Worker" option', function(done) {
        try {
            new Boss({
                fileLocation: '/fake/path'
            });
        } catch (err) {
            expect(err).to.be.instanceOf(Error);
            done();
        }
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
            var bound = _.bind(boss.makePromise, boss, { foo: "bar" });
            expect(bound).to.throw(Error);
        });

        it('creates a promise when one is requested', function() {
            var promise = boss.makePromise({
                method: 'foo'
            });

            //noinspection BadExpressionStatementJS
            expect(when.isPromiseLike(promise)).to.be.true;
        });

        it('has an associated worker once the promise is created', function() {
            var promise = boss.makePromise({
                method: 'foo'
            });

            expect(boss.worker).to.be.an('object');
        });

        it('posts a message to the worker', function(done) {
            var promise = boss.makePromise({
                method: 'foo'
            });

            promise.then(function(response) {
                //noinspection BadExpressionStatementJS
                expect(boss.worker.postMessage.called).to.be.true;
                done();
            });
        });

        it('resolves the promise with the data from the worker', function(done) {
            boss.makePromise({
                method: 'foo'
            }).then(function(response) {
                expect(response).to.equal(responseData);
                done();
            });
        });

        it('keeps the worker after the promise resolves', function(done) {
            boss.makePromise({
                method: 'foo'
            }).then(function() {
                expect(boss.worker).to.be.an('object');
                done();
            });
        });
    });

    // TODO:  this funtionality was lost in a merge; will pull it back after sparseData is
    // delivered.
    xit('can optionally terminate its worker immediately', function(done) {
        var boss = new Boss({
            Worker: makeMockWorker(this.sinon, { blah: 'true' }),
            fileLocation: '/fake/location',
            autoTerminate: true
        });

        boss.makePromise({
            method: 'foo'
        }).then(function() {
            // The worker is terminated synchronously after the promise resolves, so ...
            _.defer(function() {
                //noinspection BadExpressionStatementJS
                expect(boss.worker).to.be.null;
                done();
            });
        });
    });

    xit('can optionally terminate its worker after a number of milliseconds', function(done) {
        // To make for a fast-enough test we'll ask it to maintain the worker for 100ms
        var boss = new Boss({
            Worker: makeMockWorker(this.sinon, { blah: 'true' }),
            fileLocation: '/fake/location',
            autoTerminate: 100
        });

        boss.makePromise({
            method: 'foo'
        }).then(function() {
            expect(boss.worker).to.be.an('object');
            _.delay(function() {
                //noinspection BadExpressionStatementJS
                expect(boss.worker).to.be.null;
                done();
            }, 150);
        });
    });

});
