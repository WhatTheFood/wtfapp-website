var mongoose = require('mongoose');
;


var Schema = mongoose.Schema;

var MenuSchema = new Schema({
  date:{},

  idRestaurant: Number,
  name:{},
  dishes:[{}],
})


MenuSchema.index({idRestaurant:1}).index({date:1}).index({timestamp:1});
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
