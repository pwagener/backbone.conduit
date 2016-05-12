'use strict';

var Promise = require('es6-promise').Promise;
var _ = require('underscore');

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');

var Backbone = require('backbone');
var mockServer = require('./mockServer');
mockServer.captureAjax(Backbone.$);

global.expect = chai.expect;
chai.use(sinonChai);


function getSampleData() {
    return[
        {id: 2, name: "two", first: 0, second: 2},
        {id: 1, name: "one", first: 1, second: 0},
        {id: 3, name: "three", first: 1, second: 2}
    ];
}

function callThenResolve(collection, method) {
    return new Promise(function(resolve) {
        collection[method]().then(function() {
            resolve(collection);
        });
    });
}

function expectError(collection, method, errorType) {
    errorType = errorType || Error;

    if (!_.isFunction(collection[method])) {
        throw new Error("Collection does not have a method named '" + method + "'");
    }
    var bound = _.bind(collection[method], collection);
    expect(bound).to.throw(errorType, null, "The collection method '" + method + "' did not throw an error");
}


beforeEach(function () {
    this.FakeXMLHttpRequest = global.XMLHttpRequest = sinon.FakeXMLHttpRequest;
    this.sinon = sinon.sandbox.create();

    this.getSampleData = getSampleData;
    this.callThenResolve = callThenResolve;
    this.expectError = expectError;

    if (this.currentTest) {
        this.currentTest.sinon = this.sinon;
    }
});

afterEach(function () {
    this.sinon.restore();
});