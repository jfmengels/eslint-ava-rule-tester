import test from 'ava';
import RuleTester from '..';

const rule = {
  create: function () {
    return {};
  }
};

const mockTest = (t, expectedTitles) => {
  t.plan(expectedTitles.length);

  return title => {
    t.true(expectedTitles.includes(title), `Unexpected test: "${title}"`);
    expectedTitles.splice(expectedTitles.indexOf(title), 1);
  };
};

test('should only run tests containing `only: true` if present (valid cases)', t => {
  const expectedTitles = [
    'valid: 2',
    'valid: 3'
  ];

  const ruleTester = new RuleTester(mockTest(t, expectedTitles));
  ruleTester.run('my-awesome-rule', rule, {
    valid: [
      '1',
      {
        code: '2',
        only: true
      },
      {
        code: '3',
        only: true
      },
      {
        code: '4',
        only: false
      },
      {
        code: '5'
      }
    ],
    invalid: [
      {
        code: '1',
        errors: ['...']
      }
    ]
  });
});

test('should only run tests containing `only: true` if present (invalid cases)', t => {
  const expectedTitles = [
    'invalid: 2',
    'invalid: 3'
  ];

  const ruleTester = new RuleTester(mockTest(t, expectedTitles));
  ruleTester.run('my-awesome-rule', rule, {
    valid: [
      '1'
    ],
    invalid: [
      {
        code: '1',
        errors: ['...']
      },
      {
        code: '2',
        errors: ['...'],
        only: true
      },
      {
        code: '3',
        errors: ['...'],
        only: true
      },
      {
        code: '4',
        errors: ['...'],
        only: false
      }
    ]
  });
});

test('should only run tests containing `only: true` if present (valid + invalid cases)', t => {
  const expectedTitles = [
    'valid: 2',
    'invalid: 2'
  ];

  const ruleTester = new RuleTester(mockTest(t, expectedTitles));
  ruleTester.run('my-awesome-rule', rule, {
    valid: [
      '1',
      {
        code: '2',
        only: true
      },
      {
        code: '3'
      }
    ],
    invalid: [
      {
        code: '1',
        errors: ['...']
      },
      {
        code: '2',
        errors: ['...'],
        only: true
      }
    ]
  });
});
