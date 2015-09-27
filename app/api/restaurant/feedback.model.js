'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FeedbackSchema = new Schema({
  ate_alone: {type: Boolean},
  convivial_restaurant: {type: Boolean},
  enough_time_to_eat: {type: Boolean},
  seasoning: {type: Number},
  cooking: {type: Number},
  took_twice: {type: Boolean},
  enjoyed_my_meal: {type: Number},
  usually_enjoyis_meal: {type: Number},
  bread_thrown: {type: Number},
  user_id: {type: Number, required: false }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);