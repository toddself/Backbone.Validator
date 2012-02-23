// Backbone.Validator v0.2.0
//
// Copyright (C) 2012 Broadcastr
// Author: Todd Kennedy <todd@broadcastr.com>
// Distributed under MIT License
//
// Documentation and full license available at:
// http://toddself.github.com/backbone.validator

Backbone.Validator = (function(){
    var get_validators = function(model, attr){
        var validators = [];
        _(model.validators[attr]).each(function(val, key){
            if(key === 'fn'){
                var v = {fn: model.validators[attr].fn, opt: null};
                validators.push(v);
            } else {
                if(key in Backbone.Validator.testers){
                    var v = {fn: Backbone.Validator.testers[key], opt: model.validators[attr][key]}
                    validators.push(v);
                }
            }
            
        });
        return validators
    };
    
    var run_validators = function(value, validators){
        var errors = [];
        _(validators).each(function(validator){
            var result = validator.fn.call(this, value, validator.opt);
            if(!_.isUndefined(result)){
                errors.push(result);
            }
        });
        return errors;
    };
    
    var set_default = function(model){
        if(_.isObject(model.defaults) && (attr in model.defaults)){
            var defaults = {silent: true};
            defaults[attr] = model.defaults[attr];
            model.set(defaults);
        }        
    };
    
    return {
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
                        var errors = run_validators(attrs[attr], model_validators);
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
        test: function(value, opt){
            console.log(value, opt);
        }
    };
}());