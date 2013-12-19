'use strict';

var test = require('tape').test;
var Backbone = require('backbone');
var validate = require('../backbone.validator');

var TestModel = Backbone.Model.extend({
  validators: {
    isType: {
      isType: 'string'
    }
  },

  defaults: {
    isType: 'The littest teapot'
  }
});

var TestModelDefaults = Backbone.Model.extend({
  useDefaults: true,

  validators: {
    isType: {
      isType: 'string'
    }
  },

  defaults: {
    isType: 'The littest teapot'
  }
});

TestModel.prototype.validate= validate;
TestModelDefaults.prototype.validate= validate;

test('Testing defaults system', function(t){
  var tm = new TestModel();
  var tmDefaults = new TestModelDefaults();

  tm.set('isType', 6, {validate: true, useDefaults: true});
  t.equal(tm.get('isType'), 'The littest teapot', 'should use the defaults');

  tmDefaults.set('isType', 6, {validate: true});
  t.equal(tmDefaults.get('isType'), 'The littest teapot', 'should use defaults');

  t.end();
});