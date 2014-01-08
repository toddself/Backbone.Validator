// Backbone.Validator
//
// Copyright (C) 2012-2014 Todd Kennedy
// Author: Todd Kennedy <todd@selfassembled.org>
// Distributed under MIT License
//
// Documentation and full license available at:
// http://toddself.github.com/backbone.validator

(function(){
  'use strict';
  /**
   * Backbone.Model.changedAttributes() is obnoxious since if you're setting
   * a value that doesn't exist on a model it doesn't show that as a "changed"
   * attribute so we'll need to compute this ourselves
   * @method  getChangedAttributes
   * @private
   * @param {object} model the model
   * @param {object} attributes the list of changed attributes for the model
   * @returns {object} a hash of all the changed attributes on the model
   */
  function getChangedAttributes(model, attributes){
    var changed = model.changedAttributes() || {};
    var prevAttr = model._previousAttributes;

    Object.keys(attributes).forEach(function(attr){
      if((prevAttr && !prevAttr[attr]) && !changed[attr]){
        changed[attr] = attributes[attr];
      }
    });
    return changed;
  }

  /**
   * Generates an array of validator objects for an attribute
   * from the validators hash map attached to the model objects
   * @method  getValidators
   * @private
   * @param   {object} model The model
   * @param   {string} attr The attribute to test
   * @returns {array} An array of validator objects
   */
  function getValidators(model, attr){
    var validators = [];

    if(model.validators[attr]){
      var emptyOk = model.validators[attr].emptyOk || false;
      Object.keys(model.validators[attr]).forEach(function(key){
        var validator = model.validators[attr][key];
        if(key === 'fn'){
          validators.push({
            fn: validator,
            arg: null,
            attr: key,
            emptyOk: emptyOk
          });
        } else {
          if(typeof Testers[key] === 'function'){
            validators.push({
              fn: Testers[key],
              arg: validator,
              attr: key,
              emptyOk: emptyOk
            });
          }
        }
      });
    }
    return validators;
  }

  /**
   * Runs the validators on the attributes and generates an error object
   * for each validator that fails
   * @method  runValidators
   * @private
   * @param   {mixed} value The value to set the attribute to
   * @param   {array} validators The array of validators from `getValidators`
   * @param   {string} attribute The name of the attribute to be set
   * @returns {array} An array of error objects
   */
  function runValidators(value, attribute, validators){
    var errors = [];
    validators.forEach(function(validator){
      var result = validator.fn.call(this, value, validator.arg, attribute);
      if(result && (value !== '' && !validator.emptyOk)){
        errors.push({attr: validator.attr, error: result});
      }
    });
    return errors;
  }

  /**
   * Reduces the errors object and sets the attributes that failed validation
   * to the defaults provided.
   * @method setDefaults
   * @private
   * @param  {object} model The model
   * @param  {array} errors The errors as returned from `runValidators`
   * @return {array} the array of errors
   */
  function setDefaults(model, errors){
    // we need to produce a unique array of attrs, so we'll reduce into
    // an object with the attr set as the key, and then just get the keys
    // from that object
    var failingAttrs = Object.keys(errors.reduce(function(acc, error){
      acc[error.attr] = true;
      return acc;
    }, {}));

    failingAttrs.forEach(function(attr){
      if(model.defaults && model.defaults[attr]){
        model.attributes[attr] = model.defaults[attr];
      }
    });
  }

  /**
   * A drop-in replacement for the `validate` method on a Backbone model.
   *
   * Usage:
   *
   * ```javascript
   * var MyModel = Backbone.Model.extend({});
   * MyModel.prototype.validate = require('backbone.validate');
   * ```
   *
   * @method Validate
   * @param  {object} attributes the attributes being set
   * @param  {object} options the options hash
   * @return {array} array of error objects, if any.
   */
  function Validate(attributes, options) {
    var errors = [];
    var fail = false;
    var model = this;
    var changedAttributes = getChangedAttributes(model, attributes);

    if(model.validators){
      Object.keys(changedAttributes).forEach(function(attr){
        var validators = getValidators(model, attr);
        var value = changedAttributes[attr];
        var attrErrors = runValidators(value, attr, validators);
        errors = errors.concat(attrErrors);
      });
    }

    if(errors.length){
      if(model.useDefaults || options.useDefaults){
        setDefaults(model, errors);
      }
      return errors;
    }
  }

  /**
   * Formats a string for easier display.
   * borrowed from https://github.com/thedersen/backbone.validation
   * @method format
   * @private
   * @return {string} The composited string
   */
  var format = function() {
    var args = Array.prototype.slice.call(arguments);
    var text = args.shift();
    return text.replace(/\{(\d+)\}/g, function(match, number) {
      return args[number] ? args[number] : match;
    });
  };

  var Testers =  {
    /**
     * Tests if a value is within a given range. Range must be an array
     * @method  range
     * @memberOf Testers
     * @param   {number} value value to be tested
     * @param   {array} range acceptable range
     * @param   {string} attribute name of model attribute
     * @returns {string} error message, if any
     */
    range: function(value, range, attribute){
      if(Array.isArray(range) && range.length === 2 && typeof value === 'number'){
        if(value < range[0] || value > range[1]){
          return format('{0} is not within the range {1} - {2} for {3}', value, range[0], range[1], attribute);
        }
      }
    },

    /**
     * Tests if a value is of the required type. Checks to make sure dates
     * are both instances of the date object & valid dates
     * @method  isType
     * @memberOf Testers
     * @param   {mixed} value The value to be tested
     * @param   {string} type the type you want the value to be
     * @param   {string} attribute the name of the model attribute
     * @returns {string} error message, if any
     */
    isType: function(value, type, attribute){
      if(type === 'date'){
        if(isNaN(value.valueOf()) || Object.prototype.toString.call(value) !== '[object Date]'){
          return format('Expected {0} to be a valid date for {1}', value, attribute);
        }
      } else {
        if(typeof value !== type){
          return format('Expected {0} to be of type {1} for {2} ', value, type, attribute);
        }

      }
    },

    /**
     * Tests if a value conforms to a regex
     * @method  regex
     * @memberOf Testers
     * @param   {string} value the value to be tested
     * @param   {regex} re the regular expression
     * @param   {string} attribute the name of the model attribute
     * @returns {string} error message, if any
     */
    regex: function(value, re, attribute){
      var regex = new RegExp(re);
      if(!regex.test(value)){
        return format('{0} did not match pattern {1} for {2}', value, regex.toString(), attribute);
      }
    },

    /**
     * Tests if a value is a member of a given array
     * @method  inList
     * @param   {mixed} value value to test
     * @param   {array} list the list of acceptable values
     * @param   {string} attribute the name of the model attribute
     * @returns {string} error message, if any
     */
    inList: function(value, list, attribute){
      if(Array.isArray(list) && list.indexOf(value) === -1){
        return format('{0} is not part of [{1}] for {2}', value, list.join(', '), attribute);
      }
    },

    /**
     * Tests to see if the value is the key on an object
     * @method  isKey
     * @param   {string} value the value to test
     * @param   {object} obj the object to test for keys
     * @param   {string} attribute the name of the model attribute
     * @returns {string} error message, if any
     */
    isKey: function(value, obj, attribute){
      if(!obj[value]){
        return format('{0} is not one of [{1}] for {2}', value, Object.keys(obj).join(', '), attribute);
      }
    },

    /**
     * Tests to see if the value is under a max length
     * @method  maxLength
     * @param   {mixed} value the value to test: string or array
     * @param   {number} length the maximum length for value
     * @param   {string} attribute the name of the model attribute
     * @returns {string} error message, if any
     */
    maxLength: function(value, length, attribute){
      if(typeof value === 'string' || Array.isArray(value)){
        if(value.length > length){
           return format('{0} is shorter than {1} for {2}', value, length, attribute);
        }
      }
    },

    /**
     * Test to see if the value is over a min length
     * @method  minLength
     * @param   {mixed} value the value to test: string or array
     * @param   {number} length the minumum value for length
     * @param   {string} attribute the name of the model attribute
     * @returns {string} error message, if any
     */
    minLength: function(value, length, attribute){
      if(typeof value === 'string' || Array.isArray(value)){
        if(value.length < length){
          return format('{0} is shorter than {1} for {2}', value, length, attribute);
        }
      }
    },

    /**
     * Test to see if two values are shallow equal
     * @method  toEqual
     * @param   {mixed} value the value to test
     * @param   {mixed} example the desired value
     * @param   {string} attribute the name of the model attribute
     * @returns {string} error message, if any
     */
    toEqual: function(value, example, attribute){
      if(value !== example){
        return format('{0} is not the same as {1} for {2}', value, example, attribute);
      }
    },

    /**
     * Tests a number to make sure it's at least a specified value or higher
     * @method  minValue
     * @param   {number} value the number to test
     * @param   {number} limit the minimum value
     * @param   {string} attribute the name of the model attribute
     * @returns {string} error message, if any
     */
    minValue: function(value, limit, attribute){
      if(value <= limit){
        return format('{0} is smaller than {1} for {2}', value, limit, attribute);
      }
    },

    /**
     * Test a number fo make sure it's lower than a specified value
     * @method  maxValue
     * @param   {number} value the number to test
     * @param   {number} limit the maximum value for this number
     * @param   {string} attribute the name of the model attribute
     * @returns {string} error message, if any
     */
    maxValue: function(value, limit, attribute){
      if(value >= limit){
        return format('{0} exceeds {1} for {2}', value, limit, attribute);
      }
    }
  };

  if(typeof exports !== 'undefined'){
    module.exports = Validate;
  } else if (typeof define === 'function' && define.amd ){
    define(function(){
      return Validate;
    });
  } else {
    window.Backbone.Validator = Validate;
  }

  /****
  * ES5 compatibility shims
  */
  if (!Object.keys) {
    Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
      throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
      if (hasOwnProperty.call(obj, prop)) {
        result.push(prop);
      }
      }

      if (hasDontEnumBug) {
      for (i = 0; i < dontEnumsLength; i++) {
        if (hasOwnProperty.call(obj, dontEnums[i])) {
        result.push(dontEnums[i]);
        }
      }
      }
      return result;
    };
    }());
  }

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
      var i, len;
      for (i = 0, len = this.length; i < len; ++i) {
        if (i in this) {
          fn.call(scope, this[i], i, this);
        }
      }
    };
  }

  if ('function' !== typeof Array.prototype.reduce) {
    Array.prototype.reduce = function(callback, opt_initialValue){
    if (null === this || 'undefined' === typeof this) {
      // At the moment all modern browsers, that support strict mode, have
      // native implementation of Array.prototype.reduce. For instance, IE8
      // does not support strict mode, so this check is actually useless.
      throw new TypeError(
        'Array.prototype.reduce called on null or undefined');
    }
    if ('function' !== typeof callback) {
      throw new TypeError(callback + ' is not a function');
    }
    var index, value,
      length = this.length >>> 0,
      isValueSet = false;
    if (1 < arguments.length) {
      value = opt_initialValue;
      isValueSet = true;
    }
    for (index = 0; length > index; ++index) {
      if (this.hasOwnProperty(index)) {
      if (isValueSet) {
        value = callback(value, this[index], index, this);
      }
      else {
        value = this[index];
        isValueSet = true;
      }
      }
    }
    if (!isValueSet) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    return value;
    };
  }

  if(!Array.isArray) {
    Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === '[object Array]';
    };
  }
})();

