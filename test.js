import assert from 'node:assert';
import test from 'ava';
import {outdent} from 'outdent';
import AvaRuleTester from './index.js';

const examplePlugin = {
  rules: {
    'bad-to-good': {
      create: (context) => ({
        Identifier(node) {
          if (node.name === 'bad') {
            context.report({
              node,
              message: '"bad" should be named "good"',
              fix: fixer => fixer.replaceText(node, 'good'),
            });
          }
        },
      }),
      meta: {
        fixable: 'code',
      },
    },
  },
};

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

  const ruleTester = new AvaRuleTester(doTest);

  ruleTester.run('bad-to-good', examplePlugin.rules['bad-to-good'], {
    valid: [
      'good',
      'another',
    ],
    invalid: [
      {
        code: 'bad',
        errors: [{message: 'incorrect error message assert'}],
      },
      {
        code: 'bad',
        errors: [{message: '"bad" should be named "good"'}],
        output: 'incorrect output assert',
      },
    ]
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
      title: 'valid(1): good',
      result: {success: undefined},
      testCalls: [['t.pass']],
      rest: [],
    },
    {
      ctx: undefined,
      title: 'valid(2): another',
      result: {success: undefined},
      testCalls: [['t.pass']],
      rest: [],
    },
    {
      ctx: undefined,
      title: 'invalid(1): bad',
      result: {
        failure: getMessage('"bad" should be named "good"', 'incorrect error message assert')
      },
      testCalls: [
        [
          't.is',
          '"bad" should be named "good"',
          'incorrect error message assert',
          outdent`
            Expected values to be strictly equal:
            + actual - expected

            + '"bad" should be named "good"'
            - 'incorrect error message assert'
          `,
        ],
      ],
      rest: [],
    },
    {
      ctx: undefined,
      title: 'invalid(2): bad',
      result: {
        failure: 'Output is incorrect.',
      },
      testCalls: [
        [
          't.is',
          'good',
          'incorrect output assert',
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

  const ruleTester = new AvaRuleTester(doTest);

  ruleTester.run('bad-to-good', examplePlugin.rules['bad-to-good'], {
    valid: [
      'good',
      'another',
    ],
    invalid: [
      {
        code: 'bad',
        errors: [{message: 'incorrect error message assert'}],
      },
      {
        code: 'bad',
        errors: [{message: '"bad" should be named "good"'}],
        output: 'incorrect output assert',
        only: true,
      },
    ]
  });

  t.is(calls.length, 3);
  t.is(onlyCalls.length, 1);
  const [, title, fn] = onlyCalls[0];
  t.is(title, 'invalid(2): bad');

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
      'good',
      'incorrect output assert',
      'Output is incorrect.',
    ],
  ]);
});
