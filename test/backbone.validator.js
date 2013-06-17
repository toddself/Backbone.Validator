/* global define, beforeEach, describe, sinon, it, chai, afterEach */

(function(){
    'use strict';

    _.extend(Backbone.Model.prototype, Backbone.Validator);
    describe("Validator Tests", function(){
        var my_model;
        var Inner;
        var TestModel;
        var validation_failed;
        var model_error = function(model, errors){
            if(!window.PHANTOMJS){
                console.log.apply(console, errors);
            }
            validation_failed = true;
        };

        beforeEach(function(){
            Inner = Backbone.Model.extend();
            TestModel = Backbone.Model.extend({
                use_defaults: true,
                defaults: {
                    title: "test title",
                    highfives: 12,
                    other: {},
                    always: true,
                    must_be_inner: null
                },
                validators: {
                    title: {
                        is_type: "string",
                        max_length: 20,
                        min_length: 2,
                    },
                    highfives: {
                        range: [0, 13]
                    },
                    other: {
                        is_type: "object",
                        fn: function(value){
                            if(!_(value).has('testing_rules')){
                                return false;
                            }
                        }
                    },
                    always: {
                        to_equal: true
                    },
                    must_be_inner: {
                        is_instance: Inner
                    }
                },
                initialize: function(){
                    this.on('error', model_error);
                }
            });
            my_model = new TestModel();
            validation_failed = false;
        });

        describe("Title tests", function(){
            it("Should be a valid model", function(){
                chai.expect(_.isUndefined(my_model)).to.equal(false);
            });

            it("Shouldn't let me set a long title", function(){
                my_model.set('title', 'this is a really long title and it will fail');
                chai.expect(validation_failed).to.equal(true);
            });

            it("Shouldn't let me set too short a title", function(){
                my_model.set('title', 'a');
                chai.expect(validation_failed).to.equal(true);
            });

            it("Shouldn't let me set the title to a non-string", function(){
                my_model.set('title', false);
                chai.expect(validation_failed).to.equal(true);
            });

            it('Should use defaults when getting bad data', function(){
                my_model.set('title', false);
                chai.expect(my_model.get('title')).to.equal('test title');
            });

            it('Should use the previously-known-good value when use_defaults = false', function(){
                my_model.use_defaults = false;
                my_model.set('title', 'new title');
                my_model.set('title', false);
                chai.expect(my_model.get('title')).to.equal('new title');
            });
        });

        describe('Highfives test', function(){
            it("Shouldn't let me set a number higher than the bounds of the range", function(){
                my_model.set('highfives', 14);
                chai.expect(validation_failed).to.equal(true);
            });

            it("Shouldn't let me set a number lower than the bounds of the range", function(){
                my_model.set('highfives', -1);
                chai.expect(validation_failed).to.equal(true);
            });

            it("Should let me set a number equals to the highest bounds", function(){
                my_model.set('highfives', 13);
                chai.expect(validation_failed).to.equal(false);
            });

            it("Should let me set a number equal to the lowest bounds", function(){
                my_model.set('highfives', 0);
                chai.expect(validation_failed).to.equal(false);
            });
        });

        describe("Instance tests", function(){
            it("Shouldn't let me set instance to anything that isn't an instance of inner", function(){
                my_model.use_defaults = false;
                my_model.set('must_be_inner', true);
                chai.expect(validation_failed).to.equal(true);
            });

            it("Should let me se instance to an instance of inner", function(){
                my_model.use_defaults = false;
                my_model.set('must_be_inner', new Inner());
                chai.expect(validation_failed).to.equal(false);
            });
        });
    });
})();