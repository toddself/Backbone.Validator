'use strict';

var test = require('tape').test;
var Backbone = require('backbone');
var validate = require('../backbone.validator');

var TestModel = Backbone.Model.extend({
  defaults: {
    type: '',
    foo: 'bar'
  },

  validators: {
    foo: {
      isEqual: 'bar'
    }
  }
});
TestModel.prototype.validate = validate;

test('Should handle a missing validator', function(t){
  var tm = new TestModel();
  t.doesNotThrow(function(){
    tm.set({type: 123, foo: 'bar'}, {validate: true});
    t.equal(tm.get('type'), 123, 'should equal 123');
    t.equal(tm.get('foo'), 'bar', 'should equal bar');
  }, 'should create a model');
  t.end();

});


test('Allow for empty values', function(t){
  var TM = Backbone.Model.extend({
    defaults: {
      email: ''
    },
    validators: {
      email: {
        regex: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i,
        emptyOk: true
      }
    }
  });

  var to = new TM();
  to.set({'email': ''}, {validate: true});
  t.equal(to.get('email'), '', 'sholud be OK to be empty');
  t.end();
});