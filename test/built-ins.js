'use strict';

var test = require('tape').test;
var assert = require('assert');
var Backbone = require('backbone');
var validate = require('../backbone.validator');

var TestModel = Backbone.Model.extend({
  validators: {
    isType: {
      isType: 'string'
    },
    range: {
      range: [1,4]
    },
    regex: {
      regex: /^baz\d$/
    },
    inList: {
      inList: ['a','b','c']
    },
    isKey: {
      isKey: {bar: true}
    },
    maxLength: {
      maxLength: 5
    },
    minLength: {
      minLength: 5
    },
    toEqual: {
      toEqual: 'foobar'
    },
    minValue: {
      minValue: 5
    },
    maxValue: {
      maxValue: 5
    }
  }
});

TestModel.prototype.validate= validate;

test('Testing built-ins', function(t){
  var tm = new TestModel();
  tm.on('invalid', function(err){
    t.ok(err.validationError[0].error, 'should error');
  });

  tm.set('isType', 123, {validate: true});
  t.equal(tm.get('isType'), undefined, 'should be undefined');

  tm.set('isType', 'string', {validate: true});
  t.equal(tm.get('isType'), 'string', 'should be the word string');

  tm.set('range', 6, {validate: true});
  t.equal(tm.get('range'), undefined, 'should be undefined');

  tm.set('range', 2, {validate: true});
  t.equal(tm.get('range'), 2, 'should be 2');

  tm.set('regex', 'baz', {validate: true});
  t.equal(tm.get('regex'), undefined, 'should be undefined');

  tm.set('regex', 'baz6', {validate: true});
  t.equal(tm.get('regex'), 'baz6', 'should be baz6');

  tm.set('inList', ['badkj'], {validate: true});
  t.equal(tm.get('inList'), undefined, 'should be undefined');

  tm.set('inList', 'a', {validate: true});
  t.equal(tm.get('inList'), 'a', 'should be a');

  tm.set('isKey', 'baz', {validate: true});
  t.equal(tm.get('isKey'), undefined, 'should be undefined');

  tm.set('isKey', 'bar', {validate: true});
  t.equal(tm.get('isKey'), 'bar', 'should be bar');

  tm.set('maxLength', 'abcdef', {validate: true});
  t.equal(tm.get('maxLength'), undefined, 'should be undefined');

  tm.set('maxLength', 'abcde', {validate: true});
  t.equal(tm.get('maxLength'), 'abcde', 'should be abcde');

  tm.set('minLength', 'acbd', {validate: true});
  t.equal(tm.get('minLength'), undefined, 'should be undefined');

  tm.set('minLength', 'abcde', {validate: true});
  t.equal(tm.get('minLength'), 'abcde', 'should be abcde');

  tm.set('toEqual', 'no', {validate: true});
  t.equal(tm.get('toEqual'), undefined, 'should be undefined');

  tm.set('toEqual', 'foobar', {validate: true});
  t.equal(tm.get('toEqual'), 'foobar', 'should be foobar');

  tm.set('minValue', 4, {validate: true});
  t.equal(tm.get('minValue'), undefined, 'should be undefined');

  tm.set('minValue', 5, {validate: true});
  t.equal(tm.get('minValue'), undefined, 'should be 5');

  tm.set('maxValue', 11, {validate: true});
  t.equal(tm.get('maxValue'), undefined, 'should be undefined');

  tm.set('maxValue', 5, {validate: true});
  t.equal(tm.get('maxValue'), undefined, 'should be 5');

  t.end();
});