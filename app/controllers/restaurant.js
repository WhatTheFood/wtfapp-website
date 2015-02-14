var RestaurantModel = require('../models/restaurant');

/**
 * Get restaurants
 *
 * @param req
 * @param res
 * @returns {*}
 */
exports.getRestaurants = function (req, res) {
    if (req.query.lat && req.query.lng) {
        console.log('Geospatial querying with ' + req.query);
    } else {
        return RestaurantModel.find(function (err, restaurants) {
            if (!err) {
                return res.send(restaurants);
            } else {
                console.log(err);
                return res.status(400).send(err);
            }
        });
    }
};

/**
 * Get restaurant
 *
 * @param req
 * @param res
 * @returns {*}
 */
exports.getRestaurant = function (req, res) {
    return RestaurantModel.findOne({"id": req.params.id}, function (err, restaurant) {
        console.log(req.query);
        if (!err) {
            return res.send(restaurant);
        } else {
            console.log(err);
            return res.status(400).send(err);
        }
    });
};
