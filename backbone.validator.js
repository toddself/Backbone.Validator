// Backbone.Validator v0.3.5
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
        var validators = [];
        _(model.validators[attr]).each(function(val, key){
            // custom functions just get pushed into the validators list
            if(key === 'fn'){
                var v = {fn: model.validators[attr].fn, opt: null};
                validators.push(v);
            } else {
                // and we'll see if the other validators are preset
                if(key in Backbone.Validator.testers){
                    var v = {fn: Backbone.Validator.testers[key], opt: model.validators[attr][key]}
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
    
    var set_default = function(model, attr, errors){
        // if the validation fails and the user wants to use the default that's been defined
        // we'll do that here.  We have to set {silent: true} to prevent a recursive call
        // from being made.  This, of course, assumes that the default is valid. But if it's not
        // it's getting set anyway!
        if(_.isObject(model.defaults) && (attr in model.defaults)){
            var defaults = {silent: true};
            defaults[attr] = model.defaults[attr];
            model.set(defaults);
            model.trigger('error', model, errors)
        }        
    };
    
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
        
        validate: function(attrs) {
            // this.on('validator:use_defaults', set_default);
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
                                // _.defer(model.trigger('validator:user_defaults', model, attr, errors));
                                set_default(model, attr, errors);
                                return errors;
                            }
                            return errors;                
                        }
                    }  
                });             
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
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
    
    return {
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
            var regex = new RegExp(re);
            if(!regex.test(value)){
                return format("{0} did not match pattern {1} for {2}", value, regex.toString(), attribute);
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
        
        min_value: function(value, limit, attribute){
            if(value < limit){
                return format("{0} is smaller than {1} for {2}", value, limit, attribute);
            }
        },
        
        max_value: function(value, limit, attribute){
            if(value > limit){
                return format("{0} exceeds {1} for {2}", value, limit, attribute);
            }
        }
    };
}());