# eslint-ava-rule-tester [![Build Status](https://travis-ci.org/jfmengels/eslint-ava-rule-tester.svg?branch=master)](https://travis-ci.org/jfmengels/eslint-ava-rule-tester)

> [ESLint]'s [RuleTester] for [AVA]

Allows you to run [ESLint]'s [RuleTester] with [AVA] while still getting the nice report it provides by default.

## Install

```
$ npm install --save-dev eslint-ava-rule-tester
```


## Usage

Apart from how it is instanciated, the API is the same as [ESLint]'s [RuleTester]. For information on how to test your rule, please follow the [official documentation](http://eslint.org/docs/developer-guide/working-with-plugins#testing).

```js
import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/my-awesome-rule';

const ruleTester = new avaRuleTester(test, {
  env: {
    es6: true
  }
});

ruleTester.run('my-awesome-rule', rule, {
  valid: [
    '...'
  ],
  invalid: [
    {
      code: 'console.lgo',
      errors: [{ message: 'console.log was mistyped', column: 1, line: 1 }],
      output: 'console.log' // Optional, use this when your rule fixes the errors
    }
  ]
});
```

Run `ava --verbose` to get a better overview of which tests failed.

## License

MIT © [Jeroen Engels](https://github.com/jfmengels)

[AVA]: https://github.com/sindresorhus/ava
[ESLint]: https://github.com/eslint/eslint
[RuleTester]: (http://eslint.org/docs/developer-guide/working-with-plugins#testing)
