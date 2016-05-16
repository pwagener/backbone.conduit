'use strict';

var _ = require('underscore');

var config = require('./../src/config');

var noop = function() { };

describe("The config module", function() {

    it('provides an object', function() {
        //noinspection JSUnresolvedFunction,JSUnresolvedVariable
        expect(config).to.be.an('object');
    });

    it('can detect we are not running in a browser environment', function() {
        //noinspection BadExpressionStatementJS
        expect(config.isBrowserEnv()).to.be.false;
    });

    it('returns a promise from "enableWorker"', function() {
        var promise = config.enableWorker({
            Worker: this.sinon.spy()
        });
        //noinspection BadExpressionStatementJS
        expect(promise).to.be.an.instanceof(Promise);

        // Squash the failing promise
        promise.then(noop, noop);
    });

    it('can accept a Worker constructor', function() {
        var Worker = this.sinon.spy();

        config.enableWorker({
            Worker: Worker
        }).then(noop, noop);

        expect(config.getWorkerConstructor()).to.equal(Worker);
    });

    it('does not report the worker as enabled unless probe succeeded', function() {
        config.enableWorker({
            Worker: this.sinon.spy()
        }).then(noop, noop);

        expect(config.isWorkerEnabled()).to.be.false;
    });

    it('does not provide a worker path unless probe succeeds', function() {
        config.enableWorker({
            Worker: this.sinon.spy()
        }).then(noop, noop);

        var bound = _.bind(config.getWorkerPath, config);
        expect(bound).to.throw(Error);
    })

});
