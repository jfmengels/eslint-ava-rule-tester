'use strict';

const {RuleTester} = require('eslint');

module.exports = function (test, options) {
  let validity;
  const indices = {};

  const run = testFunction => function (text, method) {
    // TODO: When targeting Node.js 20.
    // indices[validity] ??= 0;

    indices[validity] = indices[validity] || 0;

    const name = `${validity}(${++indices[validity]}): ${text}`;
    testFunction(name, t => {
      t.pass();
      try {
        method();
      } catch (error) {
        if (error.message.includes('Output is incorrect')) {
          error.message += `\n\nActual:\n${error.actual}\n\nExpected:\n${error.expected}`;
        }

        throw error;
      }
    });
  };

  class AvaRuleTester extends RuleTester {

    constructor(testConfig) {
      super(testConfig);
    }

    static describe(text, method) {
      validity = text;
      return method.apply(this);
    }

    static get it() {
      return run(test);
    }

    static get itOnly() {
      return run(test.only);
    }
  }

  return new AvaRuleTester(options);
};
