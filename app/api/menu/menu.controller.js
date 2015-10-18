var request = require('request');
var async = require('async');

var _ = require('lodash');
var moment = require('moment');

var FeedbackModel = require('../restaurant/feedback.model.js');
var MenuModel = require('./menu.model.js');

var Response = require('../../services/response.js');

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
 * {
    "menu_feedback": {
      "feedbacks": [
        {
          "_id": "54dfeea1699af25e14e4802a", // the dishes id
          "thrown": "3"
        }
      ]
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
//db.menus.update({"_id" : ObjectId("561f49fee70430d80aebd7b7"), "dishes.name":"salade", "dishes.feedbacks.uid": { $not: {$eq: "fel"} } }, { $push : { "dishes.$.feedbacks" : { uid: "fel"} } } );
  var date = moment();

  if (_.isUndefined(req.body.user_feedback)) {
    return Response.error(res, Response.BAD_REQUEST, "You must specify a user_feedback");
  }

  var feedback = req.body.user_feedback;
  console.log(feedback,req.params.id);

  MenuModel.findById(req.params.id, function (err, doc) {
    console.log("find by id",err,doc);
  });


  //MenuModel.findOne({'id': req.params.id}, function (err, menu) {
  MenuModel.findOneAndUpdate(
    // {'id': req.params.id}
    {
      _id: req.params.id
/*
      , "dishes.feedbacks.uid": {
        "$not": {
          "$eq": "sfel"
        }
      }
      */
    }
    ,
    {
      "dishes.name": feedback.dish,
      "$push": {
        "dishes.$.feedbacks": feedback
      }
    }
    ,
    {new: true}
    ,
    function (err, menu) {
      console.log('findAndModify',err,menu)
      if (err) {
        return Response.error(res, Response.BAD_REQUEST, err);
      }

      if (!menu) {
        return Response.error(res, Response.MENU_NOT_FOUND);
      }

      return Response.success(res, Response.HTTP_CREATED, {});
    }
  );
};