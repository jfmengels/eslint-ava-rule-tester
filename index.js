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

  RuleTester.it = function (text, method) {
    const name = getName(`${validity}: ${text}`);
    test(name, t => {
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
