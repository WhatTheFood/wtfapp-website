'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MenuFeedbackSchema = new Schema({
  timestamp: {},
  userId: {},
  menuId:{},
  feedback:{},
  scorePoints: Number
});

module.exports = mongoose.model('MenuFeedback', MenuFeedbackSchema);