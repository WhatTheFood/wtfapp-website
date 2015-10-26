var request = require('request');
var async = require('async');

var _ = require('lodash');
var moment = require('moment');

var MenuFeedbackModel = require('./menufeedback.model.js');
var MenuModel = require('./menu.model.js');

var Response = require('../../services/response.js');

var config = require('../../config/environment');


/**
 * @api {post} /menus/:id/feedback Add Feedback
 * @apiName AddFeedback
 * @apiGroup Menu

 * @apiPermission user
 *
 * @apiParam {param} id The menu id
 * @apiParam {post} feedback The feedback
 *
 * @apiParamExample {json} Request-Example:
 * feedback={
    "menu_feedback": {

    },
    "user_feedback": {
      "ate_alone": false,
      "convivial_restaurant": true,
      "enough_time_to_eat": true,
      "seasoning": 2,
      "cooking": 2,
      "hot_meal": 2,
      "took_twice": true,
      "enjoyed_my_meal": 2,
      "bread_thrown": 2
    }
  }
 *
 * @apiError 4002 Restaurant not found
 * @apiError 1001 Bad request
 *
 * @apiSuccess {Restaurant} The restaurant
 */
exports.addFeedback = function (req, res) {

  if (_.isUndefined(req.body.feedback)) {
    return Response.error(res, Response.BAD_REQUEST, "You must specify a feedback");
  }
  var id = req.params.id;

  MenuModel.findById(id, function (err, menu) {
    if (err) {
      return Response.error(res, Response.BAD_REQUEST, err);
    } else if (!menu) {
      return Response.error(res, Response.MENU_NOT_FOUND);
    }
    var user = req.user;

    var date = moment();
    var scorePoints = config.POINTS_PER_ACTION;

    if (!config.DEBUG && date.diff(new moment(user.lastMenuFeedback),'hours') < config.VOTE_MIN_DELAY_IN_HOURS ){
      return Response.error(res, Response.BAD_USER_VOTE_DELAY);
    }

    var feedback = req.body.feedback;

    var menuFeedback = {
      timestamp: date,
      userId : user._id,
      feedback:feedback,
      menuId: menu._id,
      points: scorePoints
    };
    var menuFeedbackModel = new MenuFeedbackModel(menuFeedback);
    menuFeedbackModel.save(function(err,menufb){

      if (err) {
        return Response.error(res, Response.BAD_REQUEST, err);
      }

      // FIXME : this is safe & sync but it helps CHEATING :  user.update({lastMenuFeedback:date, "$inc": {points:scorePoints}}).exec();
      user.lastMenuFeedback = date;
      user.points+=scorePoints;
      user.save();

      console.log("USER : ",user.points);
      return Response.success(res, Response.HTTP_CREATED, {});
    });
  });

};

/**
 * e.g.
 * curl http://localhost:5000/api/menus/restaurant/177
 * @param req
 * @param res
 */
exports.getMenusForRestaurant = function (req, res) {
  var DATE_FORMAT = "YYYY-MM-DD";
  var idRestaurant = req.params.idRestaurant;
  var dateMin = moment();
  var dateMax = dateMin.clone().add(7,'d');
  MenuModel.find({
    idRestaurant:idRestaurant,
    date: {
      "$gte": dateMin.format(DATE_FORMAT),
      "$lte": dateMax.format(DATE_FORMAT)
    }
  }).limit(10).sort({date: 1, name:1}).then(function(menus) {
      return Response.success(res, Response.HTTP_OK, menus);
    }
  );

}


/**
 * e.g.
 * curl http://localhost:5000/api/menus/restaurant/177
 * @param req
 * @param res
 */
exports.getMenus = function (req, res) {
  var DATE_FORMAT = "YYYY-MM-DD";
  var dateMin = moment();
  var dateMax = dateMin.clone().add(7,'d');
  MenuModel.find({
    date: {
      "$gte": dateMin.format(DATE_FORMAT),
      "$lte": dateMax.format(DATE_FORMAT)
    }
  }).sort({idRestaurant:1, date: 1, name:1}).then(function(menus) {
      return Response.success(res, Response.HTTP_OK, menus);
    }
  );

}