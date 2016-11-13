import test from 'ava';
import RuleTester from '..';

const rule = {
  create: function () {
    return {};
  }
};

test('should name tests like `valid: <code>` and `invalid: <code>`', t => {
  t.plan(2);

  const expectedTitles = [
    'valid: var foo;',
    'invalid: var bar;'
  ];

  const mockTest = title => {
    const index = expectedTitles.indexOf(title);
    t.true(index >= 0);
    expectedTitles.splice(index, 1);
  };

  const ruleTester = new RuleTester(mockTest);
  ruleTester.run('my-awesome-rule', rule, {
    valid: [
      'var foo;'
    ],
    invalid: [
      {
        code: 'var bar;',
        errors: ['...']
      }
    ]
  });
});
