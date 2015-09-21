/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Dish feedback Schema
 */
var dishFeedbackSchema = new Schema({
  thrown: { type: Number },
  user_id: { type: String },
});

/*
 * Menu feedback Schema
 */
var menuFeedbackSchema = new Schema({
  ate_alone: { type: Boolean },
  convivial_restaurant: { type: Boolean },
  enough_time_to_eat: { type: Boolean },
  seasoning: { type: Number },
  cooking: { type: Number },
  took_twice: { type: Boolean },
  enjoyed_my_meal: { type: Number },
  usually_enjoyis_meal: { type: Number },
  bread_thrown: { type: Number },
  user_id: { type: Number }
});

/**
 * Meal Schema
 */

var mealSchema = new Schema({
  name: {type: String},
  foodcategory: [{
    name: {type: String},
    dishes: [{
      name: {type: String},
      feedback: { type: [dishFeedbackSchema], select:false}
    }]
  }]
});

/**
 * Menu Schema
 */

var menuSchema = new Schema({
  date: {type: Date},
  meal: { type: [mealSchema] },
  feedback: { type:[menuFeedbackSchema], select:false}
});

/**
 * Restaurant Schema
 */

var restaurantSchema = new Schema({
  id: {type: Number},
  title: {type : String},
  lat: {type: Number},
  lon: {type: Number},
  geolocation: {
    'type': {
      type: String,
      enum: 'Point',
      default: 'Point'
    },
    coordinates: {type: [Number]}
  },
  distance: {type: Number},
  area: {type: String},
  opening: {type: String},
  closing: {type: String},
  //type: {type: String, default: ''}, OR
  /*type: {
    type: { type: String }
    },*/
  accessibility: {type: Boolean},
  wifi: {type: Boolean},
  shortdesc: {type: String},
  description: {type: String},
  access: {type: String},
  operationalhours: {type: String},
  contact: {
    tel: {type: String},
    email: {type: String}
  },
  photo: {
    src: {type: String},
    alt: {type: String}
  },
  payment: [{
    name: {type: String}
  }],
  menu: {
    date: {type: Date},
    meal: { type: [mealSchema] },
    feedback: { type:[menuFeedbackSchema], select:false}
  },
  queue: {
    /**
     * Queue Schema
     */
value: {type: Number},
       votes: [{
         /**
          * Vote Schema
          */
value: {type: Number},
       userId: {type: String},
       castAt: {type: Date}
       }],
updatedAt: {type: Date},
           timeSlots: {type: [String]}
  }
});

/**
 * Restaurant methods
 */

restaurantSchema.methods = {

  /**
   * Cast the given user's vote (as a timeSlot index) about the current queue of this restaurant
   *
   * @param user - the voting user
   * @param timeSlotIndex - the index of the chosen timeSlot (see restaurant.queue.timeSlots)
   */
  voteOnQueue: function(user, timeSlotIndex) {
    // clean the voting history from :
    // - any votes of more than 30mn of lifespan
    // - any votes from the voting user (hopefully there should be 1 at most)
    this.queue.votes = this.queue.votes.filter(function (vote) {
      return vote.castAt >= Date.now() - 1800000 && vote.userId != user.email;
    });
    // cast user's vote
    var vote = {
      value: (50 / this.queue.timeSlots.length) * (2 * timeSlotIndex + 1),
      userId: user.email,
      castAt: Date.now()
    };
    this.queue.votes.push(vote);
    // update the queue based on the current voting history
    this.queue.value = this.queue.votes.reduce(function(previousValue, currentVote, index) {
      return (previousValue * index + currentVote.value) / (index + 1);
    }, 0);
    this.queue.updatedAt = Date.now();
  }
};

/**
 * Presave
 */

restaurantSchema.pre('save', function(next) {
  var restaurant = this;

  // set 2dsphere index for geospatial querying
  restaurant.geolocation = {
    type: 'Point',
    coordinates: [restaurant.lon, restaurant.lat]
  };

  // set or reset queue info
  if (!restaurant.queue || restaurant.queue.timeSlots.length === 0 || Date.now() - restaurant.queue.updatedAt > 1800000) {
    restaurant.queue = {
      value: 0,
      votes: [],
      updatedAt: Date.now(),
      timeSlots: ['-10', '10-20', '+20'] // default time slots
    };
  }

  next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
