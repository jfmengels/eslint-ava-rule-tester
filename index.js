/* eslint-disable ava/no-ignored-test-files */
'use strict';

var test = require('ava');
var RuleTester = require('eslint').RuleTester;

RuleTester.describe = function (text, method) {
  RuleTester.it.validity = text;
  return method.apply(this);
};

RuleTester.it = function (text, method) {
  test(RuleTester.it.validity + ': ' + text, method);
};

module.exports = RuleTester;
