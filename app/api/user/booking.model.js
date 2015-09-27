var mongoose = require('mongoose');
;


var Schema = mongoose.Schema;

var BookingSchema = new Schema({
  date: {
    type: String, // in milliseconds (see moment millisecond)
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
});

module.exports = mongoose.model('Booking', BookingSchema);
