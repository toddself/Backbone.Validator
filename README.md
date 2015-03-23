# Backbone.Validator
[![Build Status](https://travis-ci.org/toddself/Backbone.Validator.png)](https://travis-ci.org/toddself/Backbone.Validator)

[![browser support](https://ci.testling.com/toddself/Backbone.Validator.png)](https://ci.testling.com/toddself/Backbone.Validator)

## Versions
* 1.1.5 - Added `emptyOk` to allow fields that would normally require more complex checking (i.e. a regex) to accept empty strings.
* 1.1.0 - **breaking changes** General code clean up, allow for use via commonJS, requireJS, no module system, working with Backbone 1.0+, renamed methods and variables to camel case for JS consistancy.
* 0.92.1 - Added `is_instance` pre-defined validator
* 0.92.0 - Cleaned up the code a little, removed console.log statements, and changed `to_equal` to use `_.isEqual` for better comparison. Added comments for annotated source code, and started porting in tests from our internal codebase.  Matching latest Backbone version tested against.
* 0.4.3 - IE doesn't support `Array.prototype.indexOf`, switched to `_.indexOf()`
* 0.4.1 - The default is now validated and rejected should it not match the validation rules.  This should *hopefully* fix the call stack issues.
* 0.4.0 - Fixed many recursion bugs, `error` fires correctly even when `use_defaults` is `true`.  Passes 17 test cases so far.
* 0.3.0 - Added `format`, removed `is_url` validator (not useful)
* 0.2.5 - Pre-Defined validators
* 0.2.0 - Initial release

## Backbone Version
The version of this plugin you should use should match the version of Backbone that you're using, following [Semver](http://semver.org) rules. Underscore will need to be the minimum version required for that version of Backbone.

## Setup
Override the `prototype.validate` for your created model with the package.

```javascript
var PrimateModel = Backbone.Model.extend({
  useDefaults: true,
  defaults: {
    type: "Gorilla",
    name: "Magilla"
  },
  validators: {
    type: {
      inList: ['Gorilla', 'Human', 'Monkey']
    },
    name: {
      isType: 'string'
    }
  }
});

PrimateModel.prototype.validate = require('backbone.validator');
```

If you want the system to substitute your defaults, set `useDefaults` on your model defintion to true, or pass in `{useDefaults: true}` to your options hash when `set`ting or `save`-ing a model.

**Remember:** if you want to validate on `set`, you need to also include `{validate: true}`


## Defining Validators
Validators are defined in the `validator` object as part of the model setup.  If the value passed in doesn't meet your criteria for a valid value, return any value.  If it does match your criteria, return nothing (`undefined`).  You may attach multiple validators to each attribute -- they will be run in the order in which they are attached.  If one of them fails, the entire validation will fail and `error` will be triggered.

```javascript
var TestModel = Backbone.Model.extend({
  validators: {
    title: {
      fn: function(value){
        if(typeof(value) !== 'string'){
          return "The title has to be a valid string";
        }
      },
    },
    email: {
      regex: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i,
      emptyOk: true
    }
  }
});

var test_model = new TestModel();
test_model.set({title: "I am a title!"}, {validate: true});
test_model.get('title');
"I am a title!"
test_model.set({title: false}, {validate: true});
test_model.get('title');
"I am a title!"
test_model.set({email: 'todd@selfassembled.org'}, {validate: true});
test_model.get('email');
"todd@selfassembled.org"
test_model.set({email: ''}, {validate: true});
test_model.get('email');
""
test_model.set({email: 'hjkdhf'}, {validate: true});
test_model.get('email');
""
```


## Catching errors
You can catch errors and do something with them by attaching a listener to the `invalid` event which is triggered when the validation fails.

```javascript
TestModel.extend({
  initialize: function(){
    this.on('invalid', this.displayError);
  },
  displayError: function(errors){
    errors.forEach(function(error){
      console.log(errors.attr, errors.error);
    });
  }
});

var test_model = new TestModel();
test_model.set({title: "I am a title!"});
test_model.get('title');
"I am a title!"
test_model.set({title: false});
"The title has to be a valid string"
test_model.get('title');
"I am a title!"
```

## Defaults
You can have the validation framework substitute a reasonable default for an invalid option.  This is useful when bootstrapping the model from an untrusted source.

```javascript
TestModel.extend({
  useDefaults: true,
  defaults: {
    title: "BAD TITLE"
  }
});

var test_model = new TestModel();
test_model.set({title: "I am a title!"});
test_model.get('title');
"I am a title!"
test_model.set({title: false});
"The title has to be a valid string"
test_model.get('title');
"BAD TITLE"
```

## Empty fields with complex validation
If you have some complex set of validation rules that would normally not permit empty values, you can set `emptyOk` on the field. This will allow you to set the field to an empty string and still have it pass validation rules. This will bypass **ALL** validators for a given field, so use this with care!

## Built-in tests

<!-- START docme generated API please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN docme TO UPDATE -->

<div>


*generated with [docme](https://github.com/thlorenz/docme)*
</div>
<!-- END docme generated API please keep comment here to allow auto update -->

## Inspiration

The inspiration for this comes directly (along with the `format` function) from Thomas Pedersen's [Backbone.Validation](https://github.com/thedersen/backbone.validation).  There are a lot of similarities in structure, but different logic on how to perform the validations.


## Copyright
Backbone.Validator is copyright (c) 2012-2014 Todd Kennedy

## License
Copyright (C) 2012-2014 Todd Kennedy

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
