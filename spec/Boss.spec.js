'use strict';

var _ = require('underscore');

var Boss = require('./../src/Boss');

var makeMockWorker = require('./makeMockWorker');

var makeMockWrappedWorker = function (sinon, fakeResponse) {
    var MockWrappedWorker = function (options) {
        this.options = options;
        this._fakeResponses = {};
        if (fakeResponse) {
            this.setResponse(fakeResponse);
        }
    };
    MockWrappedWorker.prototype.send = sinon.spy(function (request) {
        return Promise.resolve(this._fakeResponses[request.method] || { data: {} });
    });
    MockWrappedWorker.prototype.terminate = sinon.spy();
    MockWrappedWorker.prototype.setResponse = function (data) {
        this._fakeResponses[data.method] = {
            data: { result: data.response }
        };
    };
    return MockWrappedWorker;
};

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

    it('terminates its worker immediately when "autoTerminate" is true', function(done) {
        var boss = new Boss({
            Worker: makeMockWorker(this.sinon),
            WrappedWorker: makeMockWrappedWorker(this.sinon),
            fileLocation: '/fake/location',
            autoTerminate: true
        });

        boss.makePromise({
            method: 'foo'
        }).then(function() {
            // The worker is terminated before the promise resolves, so ...
            expect(boss.worker).to.be.null;
            done();
        }).catch(done);
    });

    it('can optionally terminate its worker after a number of milliseconds', function(done) {
        // To make for a fast-enough test we'll ask it to maintain the worker for 100ms
        var boss = new Boss({
            WrappedWorker: makeMockWrappedWorker(this.sinon, { blah: 'true' }),
            Worker: makeMockWorker(this.sinon),
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


    describe('when instantiated', function() {
        var boss, responseData;
        var objectId;

        beforeEach(function () {
            responseData = { bar: "baz" };
            objectId = 'foo123';
            boss = new Boss({
                objectId: objectId,
                WrappedWorker: makeMockWrappedWorker(this.sinon),
                Worker: makeMockWorker(this.sinon, {}),
                fileLocation: '/fake/location'
            });
        });

        it('starts without an associated worker', function () {
            //noinspection BadExpressionStatementJS
            expect(boss.worker).to.be.undefined;
        });

        it('creates a worker immediately if requested', function (done) {
            boss.createWorkerNow().then(function() {
                expect(boss.worker).to.be.an('object');
                expect(boss.worker).to.be.an.instanceof(boss.WrappedWorkerConstructor);
                done();
            }).catch(done);
        });

        it('requires a named "method" to create a promise', function () {
            var bound = _.bind(boss.makePromise, boss, {foo: "bar"});
            expect(bound).to.throw(Error);
        });

        it('creates a promise when one is requested', function () {
            var promise = boss.makePromise({
                method: 'foo'
            });

            //noinspection BadExpressionStatementJS
            expect(promise).to.be.an.instanceof(Promise);
        });

        it('has an associated worker once the promise is created', function () {
            boss.makePromise({
                method: 'foo'
            });

            expect(boss.worker).to.be.an('object');
        });

        it('posts a message to the worker', function (done) {
            var promise = boss.makePromise({
                method: 'foo'
            });

            promise.then(function () {
                //noinspection BadExpressionStatementJS
                expect(boss.worker.send.called).to.be.true;
                expect(boss.worker.send.args[0]).to.be.an('array');
                expect(boss.worker.send.args[0][0]).to.have.property('objectId', objectId);
                done();
            }).catch(done);
        });

        it('resolves the promise with the data from the worker', function (done) {
            boss.createWorkerNow().then(function() {
                boss.worker.setResponse({ method: 'foo', response: responseData });

                boss.makePromise({
                    method: 'foo'
                }).then(function (result) {
                    expect(result).to.equal(responseData);
                    done();
                }).catch(done);
            }).catch(done);

        });

        it('keeps the worker after the promise resolves', function (done) {
            boss.makePromise({
                method: 'foo'
            }).then(function () {
                expect(boss.worker).to.be.an('object');
                done();
            }).catch(done);
        });

        it('handles multiple async calls at the same time', function(done) {
            boss.createWorkerNow().then(function() {
                boss.worker.setResponse({
                    method: 'foo',
                    response: 'from foo'
                });

                boss.worker.setResponse({
                    method: 'bar',
                    response: 'from bar'
                });

                var promise1 = boss.makePromise({
                    method: 'foo'
                }).catch(done);

                var promise2 = boss.makePromise({
                    method: 'bar'
                }).catch(done);

                var foundOne = false;
                var foundTwo = false;

                promise1.then(function(result) {
                    expect(result).to.equal('from foo');
                    foundOne = true;
                    if (foundOne && foundTwo) {
                        done();
                    }
                }).catch(done);

                promise2.then(function(result) {
                    expect(result).to.equal('from bar');
                    foundTwo = true;
                    if (foundOne && foundTwo) {
                        done();
                    }
                });
            }).catch(done);
        });
    });

});
