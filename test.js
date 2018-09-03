import assert from 'assert';
import test from 'ava';
import arrowSpacing from 'eslint/lib/rules/arrow-spacing';

import avaRuleTester from '.';

const try_ = fn => {
  try {
    return {success: fn()};
  } catch (e) {
    return {failure: e.message};
  }
};

const getMessage = (expected, actual) => {
  try {
    assert.strictEqual(expected, actual);
  } catch (e) {
    return e.message;
  }
};

test('works', t => {
  t.plan(1);
  const calls = [];
  function doTest(...args) {
    calls.push([this, ...args]);
  }

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
