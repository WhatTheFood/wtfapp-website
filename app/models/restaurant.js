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
                name: {type: String}
            }]

        }]
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
        updatedAt: {type: Date}
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
    if (!restaurant.queue) {
        restaurant.queue = {
            updatedAt: Date.now()
        }
    }

    next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
