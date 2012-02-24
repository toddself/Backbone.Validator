// Backbone.Validator v0.2.5
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
    
    var set_default = function(model){
        // if the validation fails and the user wants to use the default that's been defined
        // we'll do that here.  We have to set {silent: true} to prevent a recursive call
        // from being made.  This, of course, assumes that the default is valid. But if it's not
        // it's getting set anyway!
        if(_.isObject(model.defaults) && (attr in model.defaults)){
            var defaults = {silent: true};
            defaults[attr] = model.defaults[attr];
            model.set(defaults);
        }        
    };
    
    return {
        // extend the model with these values.
        use_defaults: false,
        
        validate: function(attrs) {
            var model = this;
            var previousAttributes = model.previousAttributes();
            // do we have any changed attributes
            if(_.isObject(previousAttributes) && _.isObject(model.validators)){
                // for each attribute changed...
                for(attr in previousAttributes){
                    if(_.isObject(model.validators[attr])){
                        var model_validators = get_validators(model, attr);
                        var errors = run_validators(attrs[attr], model_validators, attr);
                        if(errors.length > 0){  
                            if(model.use_defaults || attrs.use_defaults){
                                set_default(model);
                            }                          
                            return errors;
                        }
                    }
                }
            }
        }
    };
}());

Backbone.Validator.testers = (function(){
    return {
        range: function(value, range, attribute){
            if(_.isArray(range) && range.length === 2){
                if((value < range[0]) || (value > range[1])){
                    return value+" is not within the range "+range[0]+" "+range[1];
                }
            }
        },
        
        is_type: function(value, type, attribute){
            if(typeof(value) !== type){
                return "Expected "+value+" to be of type "+type;
            }
        },
        
        regex: function(value, re, attribute){
            if(_.isRegExp(re)){
                if(!re.test(value)){
                    return value+" did not match pattern "+re.toString();
                }
            }
        },
        
        in_list: function(value, list, attribute){
            if(_.isArray(list) && list.indexOf(value) === -1){
                return value+" is not part of ["+list.join(', ')+"]";
            }
        },
        
        is_key: function(value, obj, attribute){
            if(_.has(obj, value)){
                return value+" is not one of ["+_(obj).keys().join(', ')+"]";
            }
        },
        
        max_length: function(value, length, attribute){
            if(!_.isUndefined(value.length) && (value.length > length)){
                return "attribute value is longer than "+length;
            }
        },
        
        min_length: function(value, length, attribute){
            if(!_.isUndefined(value.length) && (value.length < length)){
                return value+'is shorter than '+length;
            }
        },
        
        to_equal: function(value, example, attribute){
            if(value !== example){
                return value+" is not the same as "+example;
            }
        },
        
        
        
    };
}());