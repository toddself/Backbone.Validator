// Backbone.Validator
//
// Copyright (C) 2012, 2013 Broadcastr
// Author: Todd Kennedy <todd.kennedy@gmail.com>
// Distributed under MIT License
//
// Documentation and full license available at:
// http://toddself.github.com/backbone.validator

(function(){
    'use strict';

    var global = this;

    // We need both of these libraries
    var Backbone = global.Backbone;
    if(!Backbone && (typeof require !== 'undefined')){
        Backbone = require('backbone');
    }
    if(!_ && (typeof require !== 'undefined')){
        _ = require('underscore');
    }

    /**
     * Returns an array of the validator functions for the given attributes
     * @method get_validators
     * @private
     * @param  {Object} model The model object
     * @param  {String} attr  The attribute to get the validators for
     * @return {Array}        An array of functions
     */
    var get_validators = function(model, attr){
        var validators = [];

        _.each(model.validators[attr], function(val, key){
            var validator;
            if(key === 'fn'){
                validators.push({fn: model.validators[attr].fn, arg: null});
            } else {
                if(key in Backbone.Validator.testers){
                    validators.push({fn: Backbone.Validator.testers[key],
                                     arg: model.validators[attr][key]});
                }
            }

        });
        return validators;
    };

    /**
     * Runs the list of validators on the data to verify it can be set
     *
     * @method run_validators
     * @private
     * @param  {Mixed} value      The value you're trying to set
     * @param  {Array} validators The validators for the attribute
     * @param  {String} attribute  The name of the attributes
     * @return {Array}            A list of all the errors returned from the validators
     */
    var run_validators = function(value, validators, attribute){
        // call each validator in the order in which it was attached to the attribute
        // should an error be returned, we'll capture it and store it
        var errors = [];
        _.each(validators, function(validator){
            var result = validator.fn.call(this, value, validator.arg, attribute);
            if(result){
                errors.push(result);
            }
        });
        return errors;
    };

    /**
     * Sets the attribute to a given default if the validation failed on setting
     * the new value for the attribute
     *
     * @method  set_default
     * @private
     * @param {Object} model    The model you wish to set the default on
     * @param {String} attr     The key you wish to set
     * @param {Object} errors   An object containing all the current errors so a
     *                          error can still be triggered to let you know
     *                          the default was set
     * @param {Array} model_validators The object containing all the validators for
     *                                      the given attribute
     * @return {Object} The errors object returned
     */
    var set_default = function(model, attr, errors, model_validators){
        if(model.defaults && (attr in model.defaults)){
            var default_errors = run_validators(model.defaults[attr], model_validators, attr);
            if(default_errors.length < 1){
                model.attributes[attr] = model.defaults[attr];
            } else {
                errors = errors.concat(default_errors);
            }
        }
        model.trigger('error', model, errors);
        return errors;
    };

    var Validator = {
        use_defaults: false,

        /**
         * Implementation of Backbone.Model.validate signature
         * @param  {Object} new_attributes The attributes given to `.set`
         * @param  {Object} options        Any options passed into `.set`
         * @return {Mixed}                 `undefined` if everything is kosher
         *                                 `array` of `string`s if not
         */
        validate: function(new_attributes, options) {
            var errors = {};
            var fail = false;
            var model = this;

            var changedAttributes = model.changedAttributes();

            if(model.validators){
                _.each(changedAttributes, function(attr){
                    if(model.validators[attr]){
                        var model_validators = get_validators(model, attr);

                        var attr_errors = run_validators(new_attributes[attr],
                                                         model_validators,
                                                         attr);

                        if(attr_errors.length){
                            errors[attr] = attr_errors;
                            fail = true;
                            if(model.use_defaults || options.use_defaults){
                                set_default(model, attr, errors, model_validators);
                            }
                        }
                    }
                });
                if(fail){
                    return errors;
                }
            }
        }
    };


    /**
     * Formats a string for easier display.
     * borrowed from https://github.com/thedersen/backbone.validation
     * @method format
     * @private
     * @return {String} The composited string
     */
    var format = function() {
        var args = Array.prototype.slice.call(arguments);
        var text = args.shift();
        return text.replace(/\{(\d+)\}/g, function(match, number) {
            return typeof !_.isUndefined(args[number]) ? args[number] : match;
        });
    };

    var Testers =  {
        // is the value in a given range
        range: function(value, range, attribute){
            if(_.isArray(range) && range.length === 2){
                if(!_.isNumber(value) || (value < range[0]) || (value > range[1])){
                    return format('{0} is not within the range {1} - {2} for {3}', value, range[0], range[1], attribute);
                }
            }
        },

        // if type is date we'll do something different.
        // also, (Since `_.isDate` returns true for invalid dates)[https://github.com/documentcloud/underscore/pull/489] means we're not going to use _.isDate
        is_type: function(value, type, attribute){
            if(type === 'date'){
                if(_.isNaN(value.valueOf()) || Object.prototype.toString.call(value) !== '[object Date]'){
                    return format("Expected {0} to be a valid date for {1}", value, attribute);
                }
            } else {
                if(typeof(value) !== type){
                    return format("Expected {0} to be of type {1} for {2} ", value, type, attribute);
                }

            }
        },

        // does it match the given regex
        regex: function(value, re, attribute){
            var regex = new RegExp(re);
            if(!regex.test(value)){
                return format("{0} did not match pattern {1} for {2}", value, regex.toString(), attribute);
            }
        },

        // is the value in this list
        in_list: function(value, list, attribute){
            if(_.isArray(list) && _.indexOf(list, value) === -1){
                return format("{0} is not part of [{1}] for {2}", value, list.join(', '), attribute);
            }
        },

        // is the value a key
        is_key: function(value, obj, attribute){
            if(_.has(obj, value)){
                return format("{0} is not one of [{1}] for {2}", value, _(obj).keys().join(', '), attribute);
            }
        },

        // does the value come in under a max?
        max_length: function(value, length, attribute){
            if(!_.isNull(value) && !_.isUndefined(value)){
                if((_.has(value, "length") && !_.isUndefined(value.length) && (value.length > length)) ||
                   (_.isString(value) && (value.length > length))){
                    return format('{0} is shorter than {1} for {2}', value, length, attribute);
                }
            }
        },

        // does the value meet a minimum requirement
        min_length: function(value, length, attribute){
            if(!_.isNull(value) && !_.isUndefined(value)){
                if((_.has(value, "length") && !_.isUndefined(value.length) && (value.length < length)) ||
                   (_.isString(value) && (value.length < length))){
                    return format('{0} is shorter than {1} for {2}', value, length, attribute);
                }
            }
        },

        // does the value equal a default
        to_equal: function(value, example, attribute){
            if(!_.isEqual(value, example)){
                return format("{0} is not the same as {1} for {2}", value, example, attribute);
            }
        },

        // is the value at least a number
        min_value: function(value, limit, attribute){
            if(value < limit){
                return format("{0} is smaller than {1} for {2}", value, limit, attribute);
            }
        },

        // does the value exceed a number
        max_value: function(value, limit, attribute){
            if(value > limit){
                return format("{0} exceeds {1} for {2}", value, limit, attribute);
            }
        },

        // is this an instance of a particular object
        is_instance: function(value, type){
            if(!(value instanceof type)){
                return format("{0} is not an instance of {1}", value, type);
            }
        }
    };

    if(typeof exports !== 'undefined'){
        module.exports = Validator;
    } else if (typeof define === 'function' && define.amd ){
        define(function(){
            return Validator;
        });
    } else {
        global.BackboneValidator = Validator;
    }

}).call(this);