'use strict';

var _ = require('underscore');
var when = require('when');

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
        expect(when.isPromiseLike(promise)).to.be.true;

        // Squash the failing promise
        promise.done(noop, noop);
    });

});
