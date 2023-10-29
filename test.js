import assert from 'assert';
import test from 'ava';
import arrowSpacing from 'eslint/lib/rules/arrow-spacing';

import avaRuleTester from '.';

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

  const ruleTester = avaRuleTester(doTest, {
    parserOptions: {
      ecmaVersion: '2018'
    }
  });

  ruleTester.run('eg-rule', arrowSpacing, {
    valid: [
      '() => {}',
      '() => {}'
    ],
    invalid: [
      {
        code: '()=> {}',
        errors: ['ham']
      },
      {
        code: '()=> {}',
        errors: ['Missing space before =>.'],
        output: 'spam'
      }
    ]
  });

  t.deepEqual(onlyCalls, []);

  const result = calls.map(([ctx, title, fn, ...rest]) => {
    const testCalls = [];
    const testObject = {
      pass(...args) {
        testCalls.push([this === testObject, ...args]);
      }
    };
    return {
      ctx,
      title,
      result: try_(() => fn(testObject)),
      testCalls,
      rest
    };
  });

  const expected = [
    {
      ctx: undefined,
      title: 'valid: () => {}',
      result: {success: undefined},
      testCalls: [[true]],
      rest: []
    },
    {
      ctx: undefined,
      title: 'valid: () => {} v2',
      result: {success: undefined},
      testCalls: [[true]],
      rest: []
    },
    {
      ctx: undefined,
      title: 'invalid: ()=> {}',
      result: {
        failure: getMessage('Missing space before =>.', 'ham')
      },
      testCalls: [[true]],
      rest: []
    },
    {
      ctx: undefined,
      title: 'invalid: ()=> {} v2',
      result: {
        failure: 'Output is incorrect.\n\nActual:\n() => {}\n\nExpected:\nspam'
      },
      testCalls: [[true]],
      rest: []
    }
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

  const ruleTester = avaRuleTester(doTest, {
    parserOptions: {
      ecmaVersion: '2018'
    }
  });

  ruleTester.run('eg-rule', arrowSpacing, {
    valid: [
      '() => {}',
      '() => {}'
    ],
    invalid: [
      {
        code: '()=> {}',
        errors: ['ham']
      },
      {
        code: '()=> {}',
        errors: ['Missing space before =>.'],
        output: 'spam',
        only: true
      }
    ]
  });

  t.is(calls.length, 3);
  t.is(onlyCalls.length, 1);
  const [, title, fn] = onlyCalls[0];
  t.is(title, 'invalid: ()=> {} v2');

  const result = try_(() => fn({pass() {}}));
  t.deepEqual(result, {failure: `
Output is incorrect.

Actual:
() => {}

Expected:
spam
`.trim()});
});
