'use strict';

const {RuleTester} = require('eslint');

const argv = require('minimist')(process.argv.slice(2));

const nameGetter = () => {
  const state = new Map();
  return name => {
    const n = state.get(name) || 0;
    state.set(name, n + 1);
    return n ? `${name} v${n + 1}` : name;
  };
};

class OnlyableRuleTester extends RuleTester {
  constructor(options) {
    const {args} = options;
    delete options.args;
    super(options);
    this.options = options;
    this.args = args || {};
  }

  run(name, ruleImpl, object) {
    function someTestCases(cb) {
      return ['valid', 'invalid'].some(validState => {
        const testCases = object[validState];
        if (!testCases) {
          return false;
        }

        for (let i = 0; i < testCases.length; i++) {
          const result = cb(testCases[i], i, testCases, validState);
          if (result === 'remove') {
            testCases.splice(i--, 1);
          } else if (result) {
            return true;
          }
        }

        return false;
      });
    }

    const {
      rules = this.args.rules || process.env.npm_config_rules,
      invalid = this.args.invalid || process.env.npm_config_invalid,
      valid = this.args.valid || process.env.npm_config_valid
    } = argv;
    if (rules) {
      if (!rules.split(',').includes(name)) {
        return;
      }

      if (invalid && !valid) {
        object.valid = [];
      }

      if (valid && !invalid) {
        object.invalid = [];
      }

      if (someTestCases(testCase => {
        return testCase && testCase.only;
      })) {
        someTestCases(testCase => {
          if (!testCase || !testCase.only) {
            return 'remove';
          }

          delete testCase.only; // Not expected by tester
        });
      } else {
        someTestCases((testCase, idx, testCases, validState) => {
          const indexes = valid && validState === 'valid' ?
            String(valid).split(',') :
            (invalid && validState === 'invalid' ?
              String(invalid).split(',') :
              []);
          if (indexes.length === 0) {
            return;
          }

          const include = indexes.includes(String(idx)) ||
            indexes.includes(String(idx - testCases.length));
          if (!include) {
            return 'remove';
          }
        });
      }
    }

    return super.run(name, ruleImpl, object);
  }
}

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
      } catch (error) {
        if (error.message.includes('Output is incorrect')) {
          error.message += `\n\nActual:\n${error.actual}\n\nExpected:\n${error.expected}`;
        }

        throw error;
      }
    });
  };

  return new OnlyableRuleTester(options);
};
