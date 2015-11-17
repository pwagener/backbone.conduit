'use strict';

var _ = require('underscore');
var when = require('when');

var mockWorkerCreator = require('./makeInThreadWorker');

var Boss = require('./../src/Boss');


describe('The Boss module', function() {

    it('provides a constructor', function() {
        expect(Boss).to.be.a('function');
    });

    it('requires a "fileLocation" option', function(done) {
        try {
            new Boss({
                Worker: mockWorkerCreator(this.sinon)
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
            Worker: mockWorkerCreator(this.sinon, { blah: 'true' }),
            fileLocation: '/fake/location',
            autoTerminate: true
        });

        boss.makePromise({
            method: 'foo'
        }).then(function() {
            // The worker is terminated before the promise resolves, so ...
            expect(boss.worker).to.be.null;
            done();
        });
    });

    it('can optionally terminate its worker after a number of milliseconds', function(done) {
        // To make for a fast-enough test we'll ask it to maintain the worker for 100ms
        var boss = new Boss({
            Worker: mockWorkerCreator(this.sinon, { blah: 'true' }),
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
            }, 110);
        });
    });


    describe('when instantiated', function() {
        var boss, responseData;

        beforeEach(function () {
            responseData = { bar: "baz" };
            boss = new Boss({
                Worker: mockWorkerCreator(this.sinon, responseData),
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
                done();
            });
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
            expect(when.isPromiseLike(promise)).to.be.true;
        });

        it('has an associated worker once the promise is created', function () {
            var promise = boss.makePromise({
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
                expect(boss.worker.postMessage.called).to.be.true;
                done();
            });
        });

        it('resolves the promise with the data from the worker', function (done) {
            boss.createWorkerNow().then(function() {
                boss.worker.setResponse(responseData);

                boss.makePromise({
                    method: 'foo'
                }).then(function (result) {
                    expect(result).to.equal(responseData);
                    done();
                });
            });

        });

        it('keeps the worker after the promise resolves', function (done) {
            boss.makePromise({
                method: 'foo'
            }).then(function () {
                expect(boss.worker).to.be.an('object');
                done();
            });
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
                });

                var promise2 = boss.makePromise({
                    method: 'bar'
                });

                var foundOne = false;
                var foundTwo = false;

                promise1.then(function(result) {
                    expect(result).to.equal('from foo');
                    foundOne = true;
                    if (foundOne && foundTwo) {
                        done();
                    }
                });

                promise2.then(function(result) {
                    expect(result).to.equal('from bar');
                    foundTwo = true;
                    if (foundOne && foundTwo) {
                        done();
                    }
                });
            });
        });
    });

});
