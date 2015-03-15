'use strict';

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');

var Backbone = require('backbone');
var mockServer = require('./mockServer');
mockServer.captureAjax(Backbone.$);

global.expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

function getSampleData() {
    return[
        {id: 2, name: "two", first: 0, second: 2},
        {id: 1, name: "one", first: 1, second: 0},
        {id: 3, name: "three", first: 1, second: 2}
    ];
}


beforeEach(function () {
    this.sinon = sinon.sandbox.create();

    this.getSampleData = getSampleData;
    if (this.currentTest) {
        this.currentTest.sinon = this.sinon;
    }
});

afterEach(function () {
    this.sinon.restore();
});