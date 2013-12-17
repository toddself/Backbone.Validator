# Backbone.Validator
[![Build Status](https://travis-ci.org/toddself/Backbone.Validator.png)](https://travis-ci.org/toddself/Backbone.Validator)
[![browser support](https://ci.testling.com/toddself/Backbone.Validator.png)](https://ci.testling.com/toddself/Backbone.Validator)


## Versions
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

## Built-in tests

<!-- START docme generated API please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN docme TO UPDATE -->

<div class="jsdoc-githubify">
<section>
<article>
<div class="container-overview">
<dl class="details">
</dl>
</div>
<dl>
<dt>
<h4 class="name" id="inList"><span class="type-signature"></span>inList<span class="signature">(value, list, attribute)</span><span class="type-signature"> &rarr; {string}</span></h4>
</dt>
<dd>
<div class="description">
<p>Tests if a value is a member of a given array</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>value</code></td>
<td class="type">
<span class="param-type">mixed</span>
</td>
<td class="description last"><p>value to test</p></td>
</tr>
<tr>
<td class="name"><code>list</code></td>
<td class="type">
<span class="param-type">array</span>
</td>
<td class="description last"><p>the list of acceptable values</p></td>
</tr>
<tr>
<td class="name"><code>attribute</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="description last"><p>the name of the model attribute</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js">backbone.validator.js</a>
<span>, </span>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js#L222">lineno 222</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>error message, if any</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">string</span>
</dd>
</dl>
</dd>
<dt>
<h4 class="name" id="isKey"><span class="type-signature"></span>isKey<span class="signature">(value, obj, attribute)</span><span class="type-signature"> &rarr; {string}</span></h4>
</dt>
<dd>
<div class="description">
<p>Tests to see if the value is the key on an object</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>value</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="description last"><p>the value to test</p></td>
</tr>
<tr>
<td class="name"><code>obj</code></td>
<td class="type">
<span class="param-type">object</span>
</td>
<td class="description last"><p>the object to test for keys</p></td>
</tr>
<tr>
<td class="name"><code>attribute</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="description last"><p>the name of the model attribute</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js">backbone.validator.js</a>
<span>, </span>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js#L236">lineno 236</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>error message, if any</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">string</span>
</dd>
</dl>
</dd>
<dt>
<h4 class="name" id="maxLength"><span class="type-signature"></span>maxLength<span class="signature">(value, length, attribute)</span><span class="type-signature"> &rarr; {string}</span></h4>
</dt>
<dd>
<div class="description">
<p>Tests to see if the value is under a max length</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>value</code></td>
<td class="type">
<span class="param-type">mixed</span>
</td>
<td class="description last"><p>the value to test: string or array</p></td>
</tr>
<tr>
<td class="name"><code>length</code></td>
<td class="type">
<span class="param-type">number</span>
</td>
<td class="description last"><p>the maximum length for value</p></td>
</tr>
<tr>
<td class="name"><code>attribute</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="description last"><p>the name of the model attribute</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js">backbone.validator.js</a>
<span>, </span>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js#L250">lineno 250</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>error message, if any</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">string</span>
</dd>
</dl>
</dd>
<dt>
<h4 class="name" id="maxValue"><span class="type-signature"></span>maxValue<span class="signature">(value, limit, attribute)</span><span class="type-signature"> &rarr; {string}</span></h4>
</dt>
<dd>
<div class="description">
<p>Test a number fo make sure it's lower than a specified value</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>value</code></td>
<td class="type">
<span class="param-type">number</span>
</td>
<td class="description last"><p>the number to test</p></td>
</tr>
<tr>
<td class="name"><code>limit</code></td>
<td class="type">
<span class="param-type">number</span>
</td>
<td class="description last"><p>the maximum value for this number</p></td>
</tr>
<tr>
<td class="name"><code>attribute</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="description last"><p>the name of the model attribute</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js">backbone.validator.js</a>
<span>, </span>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js#L310">lineno 310</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>error message, if any</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">string</span>
</dd>
</dl>
</dd>
<dt>
<h4 class="name" id="minLength"><span class="type-signature"></span>minLength<span class="signature">(value, length, attribute)</span><span class="type-signature"> &rarr; {string}</span></h4>
</dt>
<dd>
<div class="description">
<p>Test to see if the value is over a min length</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>value</code></td>
<td class="type">
<span class="param-type">mixed</span>
</td>
<td class="description last"><p>the value to test: string or array</p></td>
</tr>
<tr>
<td class="name"><code>length</code></td>
<td class="type">
<span class="param-type">number</span>
</td>
<td class="description last"><p>the minumum value for length</p></td>
</tr>
<tr>
<td class="name"><code>attribute</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="description last"><p>the name of the model attribute</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js">backbone.validator.js</a>
<span>, </span>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js#L266">lineno 266</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>error message, if any</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">string</span>
</dd>
</dl>
</dd>
<dt>
<h4 class="name" id="minValue"><span class="type-signature"></span>minValue<span class="signature">(value, limit, attribute)</span><span class="type-signature"> &rarr; {string}</span></h4>
</dt>
<dd>
<div class="description">
<p>Tests a number to make sure it's at least a specified value or higher</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>value</code></td>
<td class="type">
<span class="param-type">number</span>
</td>
<td class="description last"><p>the number to test</p></td>
</tr>
<tr>
<td class="name"><code>limit</code></td>
<td class="type">
<span class="param-type">number</span>
</td>
<td class="description last"><p>the minimum value</p></td>
</tr>
<tr>
<td class="name"><code>attribute</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="description last"><p>the name of the model attribute</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js">backbone.validator.js</a>
<span>, </span>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js#L296">lineno 296</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>error message, if any</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">string</span>
</dd>
</dl>
</dd>
<dt>
<h4 class="name" id="toEqual"><span class="type-signature"></span>toEqual<span class="signature">(value, example, attribute)</span><span class="type-signature"> &rarr; {string}</span></h4>
</dt>
<dd>
<div class="description">
<p>Test to see if two values are shallow equal</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>value</code></td>
<td class="type">
<span class="param-type">mixed</span>
</td>
<td class="description last"><p>the value to test</p></td>
</tr>
<tr>
<td class="name"><code>example</code></td>
<td class="type">
<span class="param-type">mixed</span>
</td>
<td class="description last"><p>the desired value</p></td>
</tr>
<tr>
<td class="name"><code>attribute</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="description last"><p>the name of the model attribute</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js">backbone.validator.js</a>
<span>, </span>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js#L282">lineno 282</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>error message, if any</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">string</span>
</dd>
</dl>
</dd>
<dt>
<h4 class="name" id="Validate"><span class="type-signature"></span>Validate<span class="signature">(attributes, options)</span><span class="type-signature"> &rarr; {array}</span></h4>
</dt>
<dd>
<div class="description">
<p>A drop-in replacement for the <code>validate</code> method on a Backbone model.</p>
<p>Usage:</p>
<pre><code class="lang-javascript">var MyModel = Backbone.Model.extend({});
MyModel.prototype.validate = require('backbone.validate');</code></pre>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>attributes</code></td>
<td class="type">
<span class="param-type">object</span>
</td>
<td class="description last"><p>the attributes being set</p></td>
</tr>
<tr>
<td class="name"><code>options</code></td>
<td class="type">
<span class="param-type">object</span>
</td>
<td class="description last"><p>the options hash</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js">backbone.validator.js</a>
<span>, </span>
<a href="https://github.com/toddself/Backbone.Validator/blob/update_backbone_1.0/backbone.validator.js#L112">lineno 112</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>array of error objects, if any.</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">array</span>
</dd>
</dl>
</dd>
</dl>
</article>
</section>
</div>

*generated with [docme](https://github.com/thlorenz/docme)*
<!-- END docme generated API please keep comment here to allow auto update -->

## Inspiration

The inspiration for this comes directly (along with the `format` function) from Thomas Pedersen's [Backbone.Validation](https://github.com/thedersen/backbone.validation).  There are a lot of similarities in structure, but different logic on how to perform the validations.


## Copyright
Backbone.Validator is copyright (c) 2012 Broadcastr.

## License
Copyright (C) 2012 Broadcastr

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


