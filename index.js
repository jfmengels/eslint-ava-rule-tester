'use strict';

const {RuleTester} = require('eslint');

const generateUniqueName = (testCase, scenarioType, index) => {
  testCase = typeof testCase === 'string' ? {code: testCase} : {...testCase};
  testCase.name = `${scenarioType}(${index + 1}): ${testCase.name ?? testCase.code}`;
  return testCase;
};

const normalizeTestCases = (tests) => {
  const normalized = {...tests};

  for (const scenarioType of ['valid', 'invalid']) {
    // https://github.com/eslint/eslint/blob/95075251fb3ce35aaf7eadbd1d0a737106c13ec6/lib/rule-tester/rule-tester.js#L510
    if (!normalized[scenarioType]) {
      throw new Error(`Could not find any ${scenarioType} test scenarios`);
    }

    normalized[scenarioType] = normalized[scenarioType].map((testCase, index) => generateUniqueName(testCase, scenarioType, index));
  }

  return normalized;
}

const run = testFunction => (title, method) => {
  testFunction(title, t => {
    t.pass();

    try {
      method();
    } catch (error) {
      if (error.message.includes('Output is incorrect')) {
        error.message += `\n\nActual:\n${error.actual}\n\nExpected:\n${error.expected}`;
        // TODO: Use `t.is()`
      }

      throw error;
    }
  });
};

class AvaRuleTester extends RuleTester {
  constructor(test, config) {
    super(config);

    AvaRuleTester.it = run(test);
    AvaRuleTester.itOnly = run(test.only);
  }

  run(name, rule, tests) {
    return RuleTester.prototype.run.call(this, name, rule, normalizeTestCases(tests));
  }
}

module.exports = AvaRuleTester;
