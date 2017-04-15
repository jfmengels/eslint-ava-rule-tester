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
      try {
        method();
      } catch (err) {
        if (err.message.indexOf('Output is incorrect') !== -1) {
          err.message += `\n\nActual:\n${err.actual}\n\nExpected:\n${err.expected}`;
        }
        throw err;
      }
    });
  };

  return new RuleTester(options);
};
