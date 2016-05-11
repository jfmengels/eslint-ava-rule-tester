# eslint-ava-rule-tester [![Build Status](https://travis-ci.org/jfmengels/eslint-ava-rule-tester.svg?branch=master)](https://travis-ci.org/jfmengels/eslint-ava-rule-tester)

> ESLint RuleTester for AVA

Allows you to run ESLint's RuleTester with AVA while still getting without getting

## Install

```
$ npm install --save-dev eslint-ava-rule-tester
```


## Usage

```js
import RuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/my-awesome-rule';

const ruleTester = new RuleTester({
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
			code: '...',
			errors: ['...']
    }
  ]
});
```

Run AVA with `--verbose` to get a better overview of which test failed.

## License

MIT © [Jeroen Engels](https://github.com/jfmengels)
