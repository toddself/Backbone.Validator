# Backbone.Validator

## Backbone Version
This plug-in is only tested with Backbone 0.9.1.  You'll also need to make sure you're on Underscore 1.3.1.  Not that it won't work with older versions, but there's no guarantees.

## Setup
This is designed to be used as a mixin with the `Backbone.Model` class prior to defining your models.

    _.extend(Backbone.Model.prototype, Backbone.Validator);
    
By default, `use_defaults` is set to `false`.  When you're creating your model, you can override the default setting should you want Backbone.Validator to apply the value from the `defaults` object attached to the model (should there be one).

## Defining Validators
Validators are defined in the `validator` object as part of the model setup.  If the value passed in doesn't meet your criteria for a valid value, return any value.  If it does match your criteria, return nothing (`undefined`).

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
   
## Catching errors
You can catch errors and do something with them by attaching a listener to the `error` event which is triggered when the validation fails.

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
    
## Defaults
You can have the validation framework substitute a reasonable default for an invalid option.  This is useful when bootstrapping the model from an untrusted source.

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

## Pre-Defined Validators
Pre-Defined validators are coming soon!  There model is that you'd define your validator in your model as such:

    TestModel.validators.extend({
        length: {
            range: [0, 100]
        }
    });

Where `range` is the name of the validator function from `Backbone.Validators.testers` and `[0, 100]` is the test case condition that is passed along with the value trying to be set.

## Copyright
Backbone.Validator is copyright (c) 2012 Broadcastr.

## License
Copyright (C) 2012 Broadcastr

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.