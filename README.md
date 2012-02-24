# Backbone.Validator

## Known Issues
`is_url`causes a `RangeError: Maximum call stack size exceeded` when it's enabled.  Avoid using this tester for now!

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

### List of pre-defined validators

```javascript
range: function(value, range, attribute){
    if(_.isArray(range) && range.length === 2){
        if((value < range[0]) || (value > range[1])){
            return format('{0} is not within the range {1} - {2} for {3}', value, range[0], range[1], attribute)
        }
    }
},

is_type: function(value, type, attribute){
    if(typeof(value) !== type){
        return format("Expected {0} to be of type {1} for {2} ", value, type, attribute);
    }
},

regex: function(value, re, attribute){
    if(_.isRegExp(re)){
        if(!re.test(value)){
            return format("{0} did not match pattern {1} for {2}", value, re.toString(), attribute);
        }
    }
},

in_list: function(value, list, attribute){
    if(_.isArray(list) && list.indexOf(value) === -1){
        return format("{0} is not part of [{1}] for {2}", value, list.join(', '), attribute);
    }
},

is_key: function(value, obj, attribute){
    if(_.has(obj, value)){
        return format("{0} is not one of [{1}] for {2}", value, _(obj).keys().join(', '), attribute);
    }
},

max_length: function(value, length, attribute){
    if(!_.isUndefined(value.length) && (value.length > length)){
        return format("{0} is longer than {1} for {2} ", value, length, attribute);
    }
},

min_length: function(value, length, attribute){
    if(!_.isUndefined(value.length) && (value.length < length)){
        return format('{0} is shorter than {1} for {2}', value, length, attribute);
    }
},

to_equal: function(value, example, attribute){
    if(value !== example){
        return format("{0} is not the same as {1} for {2}", value, example, attribute);
    }
},

is_url: function(value, matchers, attribute){
    // this is tricky since ICANN is going to let anything be a TLD.
    // which means we could have a doman name of 129.122.com or hostname.12
    // so we are not going to even bother with checking the validity of
    // the host other than allowing a restricted list of TLDs to match
    // against, as well as a restricted list of protocols and ports.
    // Anything more specific should be registered as either a custom
    // validator function or a regex to be passed to the regex tester     
    //
    // matchers is an object with the following pattern:
    // matchers = {
    //     protocols = ['https', 'http', 'ftp'],
    //     ports = [80, 8080, 23, 443],
    //     tlds = ['.com', '.co.uk']
    // }
    //
    // Setting any of the parameters to "all" will allow ALL values bascially
    // not performing validation on that part of the value.  Should all of
    // these values be set to 'all' no validation will actually be performed.               
    
    var url = document.createElement('a');
    url.href = value;
    
    var allowed_protocols = _.isNull(matchers) ? default_protocols : matchers.protocols;
    var allowed_ports = _.isNull(matchers) ? default_ports : matchers.ports;
    var allowed_tlds = _.isNull(matchers) ? default_tlds : matchers.tlds;
    
    if(allowed_protocols !== 'all' && allowed_protocols.indexOf(url.protocol) === -1){
        return format("{0} is not in the list of allowed protocols for {1}", url.protocol, attribute);
    }
    if(allowed_ports !== 'all' && allowed_ports.indexOf(url.port) === -1){
        return format("{0} is not in the list of allowed ports for {1}", url.port, attribute);
    }
    if(allowed_tlds !== 'all' && allowed_tlds.indexOf(url.host) === -1){
        return format("{0} is not in the list of valid top-level domains for ", url.host, attribute);
    }
}

```

### Predefined values for testers

```javascript
var default_protocols = ['http', 'https'];
var default_ports = [80, 443];
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