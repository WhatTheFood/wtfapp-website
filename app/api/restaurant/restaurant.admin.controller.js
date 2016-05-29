var request = require('request');
var async = require('async');

var _ = require('lodash');

var MenuModel = require('../menu/menu.model.js');
var RestaurantModel = require('./restaurant.model');
var UserModel = require('../user/user.model');

var Response = require('../../services/response.js');

/**
 * @api {get} /restaurants/admin/ Get all restaurants for the administrator
 * @apiName GetRestaurantsForAdmin
 * @apiGroup Restaurant Admin
 *
 * @apiPermission admin
 *
 * @apiError 4002 Restaurant not found
 *
 * @apiSuccess [Restaurant] The list of the restaurants
 *
 */
exports.getRestaurantsForAdmin = function (req, res) {

    return RestaurantModel.find({}, function (err, restaurants) {
        if (err || _.isUndefined(restaurants)) {
            return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
        }
        return Response.success(res, Response.HTTP_OK, restaurants);
    });

};

/**
 * @api {post} /restaurants/admin/enable Enable the restaurant
 * @apiName EnableRestaurant
 * @apiGroup Restaurant Admin
 *
 * @apiParam restaurantId the restaurant id
 *
 * @apiPermission admin
 *
 * @apiError 4002 Restaurant not found
 *
 * @apiSuccess [Restaurant] The restaurant
 *
 */
exports.postEnableRestaurant = function (req, res) {

    if (_.isUndefined(req.body.restaurantId)) {
        return Response.error(res, Response.BAD_REQUEST, "You must set the restaurant id on the body");
    }

    RestaurantModel.findOne({'id': req.body.restaurantId}, function (err, restaurant) {

        if (err || _.isUndefined(restaurant)) {
            return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
        }

        restaurant.is_enable = true;
        restaurant.save(function (err) {
            if (err) {
                return Response.error(res, Response.MONGODB_ERROR, err);
            }
            return Response.success(res, Response.HTTP_OK, restaurant);
        });

    });

};

/**
 * @api {post} /restaurants/admin/disable Disable the restaurant
 * @apiName DisableRestaurant
 * @apiGroup Restaurant Admin
 *
 * @apiParam restaurantId the restaurant id
 *
 * @apiPermission admin
 *
 * @apiError 4002 Restaurant not found
 *
 * @apiSuccess [Restaurant] The restaurant
 *
 */
exports.postDisableRestaurant = function (req, res) {

    if (_.isUndefined(req.body.restaurantId)) {
        return Response.error(res, Response.BAD_REQUEST, "You must set the restaurant id on the body");
    }

    RestaurantModel.findOne({'id': req.body.restaurantId}, function (err, restaurant) {

        if (err || _.isUndefined(restaurant)) {
            return Response.error(res, Response.RESTAURANT_NOT_FOUND, err);
        }

        restaurant.is_enable = false;
        restaurant.save(function (err) {
            if (err) {
                return Response.error(res, Response.MONGODB_ERROR, err);
            }
            return Response.success(res, Response.HTTP_OK, restaurant);
        });

    });

};


var getDishCategoryFromName = function (categoryName) {
    switch (categoryName.toLowerCase()) {
        case "entrées":
        case "entrée":
        case "entrees":
        case "entree":
            return "STARTER";
            break;
        case "plats":
        case "plat":
        case "grillades":
        case "grillade":
        case "steak":
        case "pizza":
        case "pizzas":
            return "MAIN";
            break;
        case "desserts":
        case "dessert":
        case "glace":
            return "DESERT";
            break;
        default:
            return "OTHER";
    }
}


/**
 * @api {post} /restaurants/refresh Populate database
 * @apiName Refresh
 * @apiGroup Restaurant Admin
 *
 * @apiError 5002 Async error
 */
exports.refreshAll = function (req, res) {
    console.time("refresh");
    var fixedRestaurant = {
        174: {
            name: "Censier",
            title: "RU Censier",
            address: "31, rue G. St Hilaire - 5ème",
            metros: ["Censier Daubenton"],
            openings: {
                midi: "11h30-14h00"
            },
            photo: {src: "/assets/RU174.jpg"},

            shortdesc: "La petite touche orientale avec ces kebabs délicieux",
            longdesc: [
                "Après une première ouverture quelque peu mouvementée à la suite d'une manif étudiante en 63 qui le réclamait au plus vite, une équipe de 24 personnes ultra soudées vous accueille aujourd'hui dans ce RU.",
                "Ici tout est frais ! Tous les jours, les légumes sont râpés minutieusement par les cuistos, les plats chauds sont cuisinés avec amour et les pizzas sont cuites au four devant vous et rien que pour vous. Il y en a pour tous les goûts: cuisine du terroir, cuisine du monde, pizzas, viandes et poissons. Mais la grande spécialité du RU, et c'est assez rare pour le préciser, ce sont les kebabs, servis avec leur assiette de salade et de frites.  Un petit délice qui ravira vos papilles !",
                "Le RU, qui accueille les nombreux étudiants de l'Université Sorbonne Nouvelle située à deux pas et ceux des Ecoles Supérieures présentes dans le quartier, est idéalement placé, entre le Jardin des Plantes et la Grande Mosquée, pour une petite balade digestive. Qui ne serait pas Toqué de ce RU ?!"
            ]
        },
        178: {
            name: "Dauphine",
            title: "RU Dauphine",
            address: "2, boulevard Lannes - 16ème",
            metros: ["Porte Dauphine"],
            openings: {
                midi: "11h20-14h15",
                cafeteria: "8h00-17h45"
            },
            photo: {src: "/assets/RU178.jpg"},
            shortdesc: "Le RU qui a la classe avec son offre alléchante",
            longdesc: [
                "Le RU Dauphine a la classe ! Ancien siège de l'OTAN, il a été entièrement rénové pour en faire un endroit plaisant et chaleureux au cœur de la célèbre Université de Dauphine.",
                "L’offre est une des plus variées et alléchantes avec 5 principaux pôles : pizzas croustillantes, pates succulentes, petits plats vapeurs, plats cuisinés et grillades, le tout fait sur place. Si vous n’arrivez pas à trouver votre bonheur parmi ces 5 pôles, il vous reste l’option CROUS express avec ces paninis, hamburgers et frites.",
                "Les 38 personnes en cuisine, qui travaillent en étroite coopération avec une toute nouvelle équipe du CROUS super motivée, prêtent une attention toute particulière à ses convives. L’équipe au complet souhaite faire de ce grand RU plus qu’un simple self en perfectionnant l’offre et en proposant des animations hautes en couleurs et en goût. Il paraît même que le CROUS a déjà sorti le tapis rouge pour accueillir un défilé de mode 100% dauphinois ! Qui ne serait pas Toqué de ce RU ?!"
            ]
        },

        179: {
            name: "Halle aux farines",
            title: "RU Halle aux farines",
            address: "Université Paris 7 - Denis Diderot - 13ème",
            metros: ["Bibliothèque François Mitterrand"],
            openings: {
                midi: "11h30-14h00"
            },
            photo: {src: "/assets/RU179.jpg"},

            shortdesc: "Le RU le plus design à l’incroyable vue sur la Seine",
            longdesc: [
                "Situé sur l’ancien site des grands moulins de Paris, le RU de la Halle aux Farine entrepose aujourd’hui bien plus que de la farine ! C'est aujourd’hui un openspace design et chaleureux, totalement rénové, qui offre une très belle vue sur la Seine et ses quais.",
                "Au menu : des pizzas tout droit sorties du four traditionnel, des petits plats cuisinés sur place dans les stands « Brasserie » et « Plats du jour » et des généreux bars à desserts et à salade (crudités fraîches garanties !). Le petit plus c’est la possibilité d’agrémenter son plat avec une large gamme de sauces gardées au chaud dans des marmites (au poivre, provençale, etc.).",
                "L’équipe du RU est tellement cool qu’elle propose de temps à autre des animations culinaires et gastronomiques. Il n’est pas rare de retrouver dans vos assiettes universitaires le plat d’un chef étoilé mijoté par les cuistots en collaboration avec ce dernier. Qui ne serait pas Toqué de ce RU ?!"
            ]
        },
    };

    function fixRestaurantModel(restaurant) {
        var fixed = fixedRestaurant[restaurant.id];
        if (fixed) {
            for (var field in fixed) {
                restaurant[field] = fixed[field];
            }
        } else {
            restaurant.menus = undefined;
        }
    }


    /* get json file and parse it */
    // ori : http://www.stockcrous.fr/static/json/crous-paris.min.json
    // fake : https://s3-eu-west-1.amazonaws.com/crousdata.whatthefood/fakecrous.min.js
    // old fake : http://thepbm.ovh.org/static/json/crous-poitiers.min.json
    false && request('http://www.stockcrous.fr/static/json/crous-paris.min.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(
                body
                    .replace(new RegExp('\r?\n', 'g'), ' ') // replace carriage returns with whitespace
                    .replace(new RegExp('\t+', 'g'), '') // replace tabulation with whitespace
            );

            var today = new Date().toISOString().slice(0, 10);

            console.log("to delete: ", MenuModel.where("date").gt(today).count().exec())
            MenuModel.where("date").gt(today).remove().exec();

            /* update */
            async.each(data.restaurants, function (resto, callback) {

                // For each restaurant
                // Save the menus
                var menus = [];

                if (resto.menus.length > 0) {
                    var menu = {};
                    menu.idRestaurant = resto.id; // External CROUS ID
                    resto.menus.forEach(function (iMenu) {
                        menu.date = iMenu.date;
                        menu.dishes = [];
                        if (menu.date <= today)
                            return;

                        iMenu.meal.forEach(function (meal) {
                            menu.name = meal.name;
                            meal.foodcategory.forEach(function (foodcategory) {
                                foodcategory.dishes.forEach(function (dish) {
                                    var pDish = {};
                                    pDish.category = getDishCategoryFromName(foodcategory.name);
                                    pDish.categoryName = foodcategory.name;
                                    pDish.name = dish.name;
                                    menu.dishes.push(pDish);
                                })
                                menus.push(menu);
                            });
                        });


                        var Menu = new MenuModel(menu);
                        Menu.save(function (err, m) {
                            if (err) {
                                return Response.error(res, Response.MENU_UPDATE_ERROR, err);
                            } else {
                            }
                        });
                    })
                }

                // fix restaurant model

                fixRestaurantModel(resto);


                RestaurantModel.findOne({"id": resto.id}, function (err, restaurant) {
                        // Save or update the restaurant
                        if (restaurant === null) {
                            console.log("saving", resto._id, resto.id, resto.name, resto.title);
                            new RestaurantModel(resto).save(function () {
                                callback(null);
                            });
                        }
                        else {
                            console.log("updating", restaurant._id,restaurant.id, restaurant.name, restaurant.title);
                            restaurant.set(resto);
                            restaurant.save(function (err) {
                                if (err) {
                                    console.log(err);
                                    callback(err);
                                }
                                else {
                                    callback(null);
                                }
                            });
                        }
                    }
                );
            }, function (err) {

                if (err)
                    return Response.error(res, Response.ASYNC_ERROR, err);

                return Response.success(res, Response.HTTP_OK);

            })
            console.timeEnd("refresh")
        }
    });

    return Response.success(res, Response.HTTP_OK, {});
};


/**
 * @api {put} /users/:id Update a user
 * @apiName PutUser
 * @apiGroup User
 *
 * @apiParam id The user id
 *
 * @apiE
 *
 * @apiError 1001 Bad request
 * @apiError 4001 User not found
 *
 * @apiSuccess User the updated user
 *
 * The put of the user can :
 *
 * - Update user information
 * - Update a preference
 * - Run an action
 *
 */
exports.putUser = function (req, res) {

    if (_.isUndefined(req.params.id)) {
        return Response.error(req, Response.BAD_REQUEST, "id not provide");
    }

    UserModel.findById(req.params.id, function (err, user) {

        if (!user) {
            return Response.error(res, Response.USER_NOT_FOUND);
        }

        if (err) {
            return Response.error(res, Response.USER_NOT_FOUND, err);
        }

        // first we check the password constraint
        if (req.body.password) {
            var response = updateUserPassword(user, req.body.password);
            if (response) {
                return response;
            }
        }

        // then -- We want to update a preference
        if (req.body.preference) {
            var response = updateUserPreferences(user, req.body.preference);
            if (response) {
                return response;
            }
        }

        if (req.body.email) {
            user.email = req.body.email;
        }


        if (req.body.first_name) {
            user.first_name = req.body.first_name;
        }

        if (req.body.last_name) {
            user.last_name = req.body.last_name;
        }

        // -- We want to run an action
        if (req.body.action) {
            switch (req.body.action) {
                case 'increase_points':
                    user = updateUserPoints(user);
                    user = updateActionCount(user, req.body.reason);
                    break;
            }
        }

        return user.save(function (err) {
            if (!err) {
                return Response.success(res, Response.HTTP_OK, user);
            }
            else {
                return Response.error(res, Response.USER_NOT_FOUND, err);
            }
        });
    });

};
