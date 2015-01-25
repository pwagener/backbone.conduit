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

beforeEach(function () {
    this.sinon = sinon.sandbox.create();

    if (this.currentTest) {
        this.currentTest.sinon = this.sinon;
    }
});

afterEach(function () {
    this.sinon.restore();
});