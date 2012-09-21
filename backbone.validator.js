// Backbone.Validator v0.92
//
// Copyright (C) 2012 Broadcastr
// Author: Todd Kennedy <todd@broadcastr.com>
// Distributed under MIT License
//
// Documentation and full license available at:
// http://toddself.github.com/backbone.validator

Backbone.Validator = (function(){
    var get_validators = function(model, attr){
        // we want to gather all the validators that are present for this attribute
        var validators = [], v;
        _(model.validators[attr]).each(function(val, key){
            // custom functions just get pushed into the validators list
            if(key === 'fn'){
                v = {fn: model.validators[attr].fn, opt: null};
                validators.push(v);
            } else {
                // and we'll see if the other validators are preset
                if(key in Backbone.Validator.testers){
                    v = {fn: Backbone.Validator.testers[key], opt: model.validators[attr][key]};
                    validators.push(v);
                }
            }

        });
        return validators;
    };

    var run_validators = function(value, validators, attribute){
        // call each validator in the order in which it was attached to the attribute
        // should an error be returned, we'll capture it and store it
        var errors = [];
        _(validators).each(function(validator){
            var result = validator.fn.call(this, value, validator.opt, attribute);
            if(!_.isUndefined(result)){
                errors.push(result);
            }
        });
        return errors;
    };

    var set_default = function(model, attr, errors, model_validators){
        // if the validation fails and the user wants to use the default that's been defined
        // we'll do that here.  We have to set {silent: true} to prevent a recursive call
        // from being made.
        if(_.isObject(model.defaults) && (attr in model.defaults)){
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

    // we only want to bother with attributes that have changed so we don't
    // revalidate valid data OR invalidate data that was passed in during
    // instantiation to get around model validation.  that sounds dumb, but
    // it might be necessary
    var get_changed_attributes = function(previous, current){
        var changedAttributes = [];
        _(current).each(function(val, key){
            if(!_(previous).has(key)){
                changedAttributes.push(key);
            } else if (!_.isEqual(val, previous[key])){
                changedAttributes.push(key);
            }
        });
        return changedAttributes;
    };

    return {
        // extend the model with these values.
        use_defaults: false,

        validate: function(attrs, options) {
            var errors;
            var model = this;
            var changedAttributes = get_changed_attributes(model.previousAttributes(), attrs);
            if(_.isObject(model.validators)){
                // for each attribute changed...
                _(changedAttributes).each(function(attr){
                    if(_.isObject(model.validators[attr])){
                        var model_validators = get_validators(model, attr);
                        errors = run_validators(attrs[attr], model_validators, attr);
                        if(errors.length > 0){
                            if(model.use_defaults || attrs.use_defaults){
                                set_default(model, attr, errors, model_validators);
                            }
                        }
                    }
                });
            }
            if(_.isArray(errors) && errors.length > 0){
                return errors;
            }
        }
    };
}());

Backbone.Validator.testers = (function(){

    // borrowed from https://github.com/thedersen/backbone.validation
    var format = function() {
        var args = Array.prototype.slice.call(arguments);
        var text = args.shift();
        return text.replace(/\{(\d+)\}/g, function(match, number) {
            return typeof !_.isUndefined(args[number]) ? args[number] : match;
        });
    };

    return {
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
            if(regex.test(value)){
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
}());