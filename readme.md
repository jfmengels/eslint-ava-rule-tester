# eslint-ava-rule-tester

> [ESLint]'s [RuleTester] for [AVA]

Allows you to run [ESLint]'s [RuleTester] with [AVA] while still getting the nice report it provides by default.

## Install

```sh
npm install --save-dev eslint-ava-rule-tester
```

## Usage

Apart from how it is instantiated, the API is the same as [ESLint]'s [RuleTester]. For information on how to test your rule, please follow the [official documentation](https://eslint.org/docs/latest/extend/plugins#testing).

```js
import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/my-awesome-rule.js';

const ruleTester = new AvaRuleTester(test, {
  languageOptions: {
    ecmaVersion: 2024,
  },
});

ruleTester.run('my-awesome-rule', rule, {
  valid: [
    '...',
  ],
  invalid: [
    {
      code: 'console.lgo',
      errors: [{ message: 'console.log was mistyped', column: 1, line: 1 }],
      output: 'console.log', // Optional, use this when your rule fixes the errors
    },
  ],
});
```

Run `ava --verbose` to get a better overview of which tests failed.

## License

MIT © [Jeroen Engels](https://github.com/jfmengels)

[AVA]: https://github.com/sindresorhus/ava
[ESLint]: https://github.com/eslint/eslint
[RuleTester]: (https://eslint.org/docs/latest/integrate/nodejs-api#ruletester)
