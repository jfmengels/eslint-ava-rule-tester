'use strict';

const {RuleTester} = require('eslint');

module.exports = function (test, options) {
  let validity;
  const indices = {};

  RuleTester.describe = function (text, method) {
    validity = text;
    return method.apply(this);
  };

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

  RuleTester.it = run(test);
  RuleTester.itOnly = run(test.only);

  return new RuleTester(options);
};
