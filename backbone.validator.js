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
    var default_protocols = ['http', 'https'];
    var default_ports = [80];
    var default_tlds = 'all';
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
    };
}());