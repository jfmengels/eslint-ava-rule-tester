import {RuleTester} from 'eslint';

const generateUniqueName = (testCase, scenarioType, index) => {
  testCase = typeof testCase === 'string' ? {code: testCase} : {...testCase};
  testCase.name = `${scenarioType}(${index + 1}): ${testCase.name ?? testCase.code}`;
  return testCase;
};

const normalizeTestCases = tests => {
  const normalized = {...tests};

  for (const scenarioType of ['valid', 'invalid']) {
    // https://github.com/eslint/eslint/blob/95075251fb3ce35aaf7eadbd1d0a737106c13ec6/lib/rule-tester/rule-tester.js#L510
    if (!normalized[scenarioType]) {
      throw new Error(`Could not find any ${scenarioType} test scenarios`);
    }

    normalized[scenarioType] = normalized[scenarioType].map((testCase, index) => generateUniqueName(testCase, scenarioType, index));
  }

  return normalized;
};

const run = testFunction => (title, method) => {
  testFunction(title, t => {
    try {
      method();
      t.pass();
    } catch (error) {
      if (error.code === 'ERR_ASSERTION' && error.operator === 'strictEqual') {
        t.is(error.actual, error.expected, error.message);
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

export default AvaRuleTester;
