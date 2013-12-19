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
