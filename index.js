'use strict';

const RuleTester = require('eslint').RuleTester;

const isOnly = testCase => testCase && testCase.only;
const hasOnly = testCases =>
  (testCases.valid || []).some(isOnly) || (testCases.invalid || []).some(isOnly);

function filterOnly(testCase) {
  if (!testCase) {
    return testCase;
  }
  const onlyValid = (testCase.valid || []).filter(isOnly);
  const onlyInvalid = (testCase.invalid || []).filter(isOnly);

  if (onlyValid.length === 0 && onlyInvalid.length === 0) {
    return testCase;
  }

  return Object.assign(testCase, {
    valid: onlyValid,
    invalid: onlyInvalid
  });
}

module.exports = function (test, options) {
  RuleTester.describe = function (text, method) {
    RuleTester.it.validity = text;
    return method.apply(this);
  };

  RuleTester.it = function (text, method) {
    console.log(text)
    const testMethod = this.hasOnly ? test.only.bind(test) : test;
    testMethod(RuleTester.it.validity + ': ' + text, function (t) {
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

  const baseRun = RuleTester.prototype.run;

  RuleTester.prototype.run = function (ruleName, rule, testSuite) {
    this.useOnly = hasOnly(testSuite);
    return baseRun.call(this, ruleName, rule, filterOnly(testSuite));
  };

  return new RuleTester(options);
};
