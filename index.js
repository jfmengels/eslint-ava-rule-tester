import {RuleTester} from 'eslint';

export default function (test, options) {
  let validity;
  const indices = {};

  RuleTester.describe = function (text, method) {
    validity = text;
    return method.apply(this);
  };

  const run = testFunction => function (text, method) {
    // TODO: When targeting Node.js 20.
    // indices[validity] ??= 0;

    indices[validity] = indices[validity] || 0;

    const name = `${validity}(${++indices[validity]}): ${text}`;
    testFunction(name, t => {
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

  RuleTester.it = run(test);
  RuleTester.itOnly = run(test.only);

  return new RuleTester(options);
};
