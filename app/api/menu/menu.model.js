var mongoose = require('mongoose');
;


var Schema = mongoose.Schema;

var MenuSchema = new Schema({

  date:{},

  idRestaurant: Number,
  name:{},
  dishes:[{}],
  feedbacks:[{}]
})


/*
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
 */

var MenuModel =  mongoose.model('Menu', MenuSchema);

module.exports = MenuModel;
