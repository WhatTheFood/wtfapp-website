/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * Menu Schema
 */

var menuSchema = new Schema({
    date: {type: Date},
    meal: [{
        name: {type: String},
        foodcategory: [{
            name: {type: String},
            dishes: [{
                name: {type: String},
                feedback: [{
                    thrown: { type: Number }
                    user_id: { type: Number },
                }]
            }]
        }]
    }],

    feedback: [{
      ate_alone: { type: Boolean },
      convivial_restaurant: { type: Boolean },
      enough_time_to_eat: { type: Boolean },
      seasoning: { type: Number },
      cooking: { type: Number },
      hot_meal: { type: Number },
      meal_quality: { type: Number },
      enjoyed_my_meal: { type: Number },
      usually_enjoyis_meal: { type: Number },
      threw_away_food_itooked: { type: Boolean },
      threw_away_food_was_served: { type: Boolean },
      bread_thrown: { type: Number },
      user_id: { type: Number }
    }]
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
    menus: [menuSchema],
    queue: {
        value: {type: Number},
        votes: {type: Number},
        updatedAt: {type: Date},
        timeSlots: {type: [String]}
    }
});

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

    // set queue info upon first insertion
    if (!restaurant.queue || restaurant.queue.timeSlots.length === 0) {
        restaurant.queue = {
            value: 0,
            votes: 0,
            updatedAt: Date.now(),
            timeSlots: ['-10', '10-20', '+20'] // default time slots
        }
    }

    next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
