'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QueueFeedbackSchema = new Schema({
  timestamp: {},
  userId: {},
  menuId:{},
  feedback:{},
  scorePoints: 0
});

QueueFeedbackSchema.index({menuId:1}).index({userId:1}).index({timestamp:1});

module.exports = mongoose.model('QueueFeedbackSchema', QueueFeedbackSchema);