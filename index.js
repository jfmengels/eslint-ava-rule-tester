'use strict';

var RuleTester = require('eslint').RuleTester;

module.exports = function (test, options) {
  RuleTester.describe = function (text, method) {
    RuleTester.it.validity = text;
    return method.apply(this);
  };

  RuleTester.it = function (text, method) {
    test(RuleTester.it.validity + ': ' + text, function (t) {
      t.pass();
      method();
    });
  };

  return new RuleTester(options);
};
