var mongoose = require('mongoose');
;
var validator = require('validator');

var Schema = mongoose.Schema;

var BookingSchema = new Schema({
  date: {
    type: String,
    required: true
  },
  when: {
    type: String,
    required: true
  },
  restaurant: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Booking', BookingSchema);
