'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
var Backbone = require('backbone');

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