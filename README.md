# Backbone.Validator
[![Build Status](https://travis-ci.org/toddself/Backbone.Validator.png?branch=update_backbone_1.0)](https://travis-ci.org/toddself/Backbone.Validator)

## Versions
* 0.92.1 - Added `is_instance` pre-defined validator
* 0.92.0 - Cleaned up the code a little, removed console.log statements, and changed `to_equal` to use `_.isEqual` for better comparison. Added comments for annotated source code, and started porting in tests from our internal codebase.  Matching latest Backbone version tested against.
* 0.4.3 - IE doesn't support `Array.prototype.indexOf`, switched to `_.indexOf()`
* 0.4.1 - The default is now validated and rejected should it not match the validation rules.  This should *hopefully* fix the call stack issues.
* 0.4.0 - Fixed many recursion bugs, `error` fires correctly even when `use_defaults` is `true`.  Passes 17 test cases so far.
* 0.3.0 - Added `format`, removed `is_url` validator (not useful)
* 0.2.5 - Pre-Defined validators
* 0.2.0 - Initial release

## Backbone Version
This plug-in is only tested with Backbone 0.9.1.  You'll also need to make sure you're on Underscore 1.3.1.  Not that it won't work with older versions, but there's no guarantees.

## Setup
This is designed to be used as a mixin with the `Backbone.Model` class prior to defining your models.

    _.extend(Backbone.Model.prototype, Backbone.Validator);
    
By default, `use_defaults` is set to `false`.  When you're creating your model, you can override the default setting should you want Backbone.Validator to apply the value from the `defaults` object attached to the model (should there be one).

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
           }
       }
   }
});

var test_model = new TestModel();
test_model.set({title: "I am a title!"});
test_model.get('title');
"I am a title!"
test_model.set({title: false});
test_model.get('title');
"I am a title!"
```
   
   
## Catching errors
You can catch errors and do something with them by attaching a listener to the `error` event which is triggered when the validation fails.

```javascript
TestModel.extend({
    initialize: function(){
        this.on('error', this.display_error);
    },
    display_error: function(model, error){
        console.log(error);
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
    use_defaults: true,
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

## Pre-Defined Validators
Pre-Defined validators can be added to the list of validators for a given attribute.

```javascript
TestModel.validators.extend({
    title: {
        is_type: 'string',
        max_length: 40
    }
});

var t = new TestModel();
t.set({title: 'this is a new title'});
t.get('title');
"this is a new title"
t.set({title: false});
"Expected false to be of type string"
t.get('title');
"this is a new title"    
t.set({title: 'this title is way too long to be set and it should not get set because it is way too long and like if it gets set it will suck because this is way too long'});
"Attribute value was longer than 40 characters"
t.get('title');    
"this is a new title"
```

### Extending the pre-defined validators

The pre-defined validators list may be added to by extending the Backbone.Validator.testers object.

```javascript
_.extend(Backbone.Validator.testers, {
    no_hotdogs_without_mustard: function(value, mustard, attribute){
        if(value.indexOf('hotdogs') > -1 && mustard === false){
            return format('{0} MAY NOT BE A HOTDOG WITHOUT MUSTARD!', attribute);
        }
    }
});
```

`is_type` allows for checking of `date` objects now.

### List of pre-defined validators

```javascript
// does the value exist within a given range, inclusive
range: function(value, range, attribute){
    if(_.isArray(range) && range.length === 2){
        if((value <= range[0]) || (value >= range[1])){
            return format('{0} is not within the range {1} - {2} for {3}', value, range[0], range[1], attribute)
        }
    }
},

// if type is date we'll do something different.
// also, (Underscore: add `_.isValidDate`)[https://github.com/documentcloud/underscore/pull/489] means we're not going to use _.isDate
// and since this is generic we can't use our forked version
is_type: function(value, type, attribute){
    if(type === 'date'){
        if(_.isNaN(value.valueOf()) || toString.call(value) != '[object Date]'){
            return format("Expected {0} to be a valid date for {1}", value, attribute);
        }
    } else {
        if(typeof(value) !== type){
            return format("Expected {0} to be of type {1} for {2} ", value, type, attribute);
        }
        
    }            
},

// Does it pass a regular expression test
regex: function(value, re, attribute){
    var regex = new RegExp(re);
    if(regex.test(value)){
        return format("{0} did not match pattern {1} for {2}", value, regex.toString(), attribute);
    }
},

// is it present in a given list
in_list: function(value, list, attribute){
    if(_.isArray(list) && list.indexOf(value) === -1){
        return format("{0} is not part of [{1}] for {2}", value, list.join(', '), attribute);
    }
},

// is a key of an object
is_key: function(value, obj, attribute){
    if(_.has(obj, value)){
        return format("{0} is not one of [{1}] for {2}", value, _(obj).keys().join(', '), attribute);
    }
},

// does the value come in under a max?
max_length: function(value, length, attribute){
    if(!_.isNull(value) && !_.isUndefined(value) && _.has(value, "length") && !_.isUndefined(value.length) && (value.length > length)){
        return format("{0} is longer than {1} for {2} ", value, length, attribute);
    }
},

// does the value meet a minimum requirement
min_length: function(value, length, attribute){
    if(!_.isNull(value) && !_.isUndefined(value) && _.has(value, "length") && !_.isUndefined(value.length) && (value.length < length)){
        return format('{0} is shorter than {1} for {2}', value, length, attribute);
    }
},

// are they the same
to_equal: function(value, example, attribute){
    if(!_.isEqual(value, example)){
        return format("{0} is not the same as {1} for {2}", value, example, attribute);
    }
},

// unbounded top 
min_value: function(value, limit, attribute){
    if(value < limit){
        return format("{0} is smaller than {1} for {2}", value, limit, attribute);
    }
},

// unbounded bottom
max_value: function(value, limit, attribute){
    if(value > limit){
        return format("{0} exceeds {1} for {2}", value, limit, attribute);
    }
}

// is an instance of an object
is_instance: function(value, type){
    if(!(value instanceof type)){
        return format("{0} is not an instance of {1}", value, type);
    }
}
```

## Inspiration

The inspiration for this comes directly (along with the `format` function) from Thomas Pedersen's [Backbone.Validation](https://github.com/thedersen/backbone.validation).  There are a lot of similarities in structure, but different logic on how to perform the validations.


## Copyright
Backbone.Validator is copyright (c) 2012 Broadcastr.

## License
Copyright (C) 2012 Broadcastr

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
