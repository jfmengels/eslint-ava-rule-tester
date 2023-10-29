'use strict';

const {RuleTester} = require('eslint');

const nameGetter = () => {
  const state = new Map();
  return name => {
    const n = state.get(name) || 0;
    state.set(name, n + 1);
    return n ? `${name} v${n + 1}` : name;
  };
};

module.exports = function (test, options) {
  let validity;
  const getName = nameGetter();

  RuleTester.describe = function (text, method) {
    validity = text;
    return method.apply(this);
  };

  const run = isOnly => function (text, method) {
    const name = getName(`${validity}: ${text}`);
    (isOnly ? test.only : test)(name, t => {
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

  RuleTester.it = run(false);
  RuleTester.itOnly = run(true);

  return new RuleTester(options);
};
