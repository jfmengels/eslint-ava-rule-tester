import assert from 'node:assert';
import test from 'ava';
import eslintExperimentalApis from 'eslint/use-at-your-own-risk';
import {outdent} from 'outdent';
import AvaRuleTester from './index.js';

// TODO[@fisker]: Write a simple rule instead.
const arrowSpacing = eslintExperimentalApis.builtinRules.get('arrow-spacing');

const try_ = fn => {
  try {
    return {success: fn()};
  } catch (error) {
    return {failure: error.message};
  }
};

const getMessage = (expected, actual) => {
  try {
    assert.strictEqual(expected, actual);
  } catch (error) {
    return error.message;
  }
};

test('works', t => {
  t.plan(2);
  const calls = [];
  const onlyCalls = [];
  function doTest(...args) {
    calls.push([this, ...args]);
  }

  doTest.only = function (...args) {
    onlyCalls.push([this, ...args]);
  };

  const ruleTester = new AvaRuleTester(doTest, {
    parserOptions: {
      ecmaVersion: '2018',
    },
  });

  ruleTester.run('eg-rule', arrowSpacing, {
    valid: [
      '() => {}',
      '() => {}',
    ],
    invalid: [
      {
        code: '()=> {}',
        errors: ['ham'],
      },
      {
        code: '()=> {}',
        errors: ['Missing space before =>.'],
        output: 'spam',
      },
    ],
  });

  t.deepEqual(onlyCalls, []);

  const result = calls.map(([ctx, title, fn, ...rest]) => {
    const testCalls = [];
    const testObject = {
      pass(...args) {
        testCalls.push(['t.pass', ...args]);
      },
      is(...args) {
        testCalls.push(['t.is', ...args]);
      },
    };
    return {
      ctx,
      title,
      result: try_(() => fn(testObject)),
      testCalls,
      rest,
    };
  });
  const expected = [
    {
      ctx: undefined,
      title: 'valid(1): () => {}',
      result: {success: undefined},
      testCalls: [['t.pass']],
      rest: [],
    },
    {
      ctx: undefined,
      title: 'valid(2): () => {}',
      result: {success: undefined},
      testCalls: [['t.pass']],
      rest: [],
    },
    {
      ctx: undefined,
      title: 'invalid(1): ()=> {}',
      result: {
        failure: getMessage('Missing space before =>.', 'ham'),
      },
      testCalls: [
        [
          't.is',
          'Missing space before =>.',
          'ham',
          outdent`
            Expected values to be strictly equal:
            + actual - expected

            + 'Missing space before =>.'
            - 'ham'
          `,
        ],
      ],
      rest: [],
    },
    {
      ctx: undefined,
      title: 'invalid(2): ()=> {}',
      result: {
        failure: 'Output is incorrect.',
      },
      testCalls: [
        [
          't.is',
          '() => {}',
          'spam',
          'Output is incorrect.',
        ],
      ],
      rest: [],
    },
  ];

  t.deepEqual(result, expected);
});

test('only', t => {
  const calls = [];
  const onlyCalls = [];
  function doTest(...args) {
    calls.push([this, ...args]);
  }

  doTest.only = function (...args) {
    onlyCalls.push([this, ...args]);
  };

  const ruleTester = new AvaRuleTester(doTest, {
    parserOptions: {
      ecmaVersion: '2018',
    },
  });

  ruleTester.run('eg-rule', arrowSpacing, {
    valid: [
      '() => {}',
      '() => {}',
    ],
    invalid: [
      {
        code: '()=> {}',
        errors: ['ham'],
      },
      {
        code: '()=> {}',
        errors: ['Missing space before =>.'],
        output: 'spam',
        only: true,
      },
    ],
  });

  t.is(calls.length, 3);
  t.is(onlyCalls.length, 1);
  const [, title, fn] = onlyCalls[0];
  t.is(title, 'invalid(2): ()=> {}');

  const testCalls = [];
  try_(() => fn({
    pass(...args) {
      testCalls.push(['t.pass', ...args]);
    },
    is(...args) {
      testCalls.push(['t.is', ...args]);
    },
  }));
  t.deepEqual(testCalls, [
    [
      't.is',
      '() => {}',
      'spam',
      'Output is incorrect.',
    ],
  ]);
});
