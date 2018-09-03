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
        errors: ['spam']
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
        failure:
          'Input A expected to strictly equal input B:\n\u001B[32m+ expected' +
          '\u001B[39m \u001B[31m- actual\u001B[39m\n\n\u001B[31m-\u001B[39m ' +
          '\'Missing space before =>.\'\n\u001B[32m+\u001B[39m \'ham\''
      },
      testCalls: [[true]],
      rest: []
    },
    {
      ctx: undefined,
      title: 'invalid: ()=> {} v2',
      result: {
        failure:
          'Input A expected to strictly equal input B:\n\u001B[32m+ expected' +
          '\u001B[39m \u001B[31m- actual\u001B[39m\n\n\u001B[31m-\u001B[39m ' +
          '\'Missing space before =>.\'\n\u001B[32m+\u001B[39m \'spam\''
      },
      testCalls: [[true]],
      rest: []
    }
  ];

  t.deepEqual(result, expected);
});
