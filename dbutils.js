/**
 * Created by fel on 03/10/2015.
 */

host = db.serverStatus().host;
prompt = function(){
  return db+"@"+host+"$ ";
}

WTF = {
  updateUserRole: function(email,role){
    var user = db.users.findOne({email: email});
    user.role = role;
    db.users.save(user);
  },

  setUserFavoriteRu: function (email,idFavoriteRu) {
    var me = db.users.findOne({email: email});
    me.favoriteRu=idFavoriteRu;
    db.users.save(me);
  },
  resetUserCurrentRu: function (email) {
    var me = db.users.findOne({email: email});
    me.lastQueueFeeback.updatedAt = ISODate("2015-02-20T00:00:00.000Z")
    db.users.save(me);
  }

};


db.users.aggregate([ { $group:{ _id: "$favoriteRu" , count: {$sum:1} } }]);

var m =
{
  "_id": ObjectId("563032c9282925140e2e56bc"), "idRestaurant": 179, "date": "2015-11-02", "name": "midi", "dishes": [{
  "name": "Salad'bar de Crudites fraiches du jour",
  "categoryName": "Entrées",
  "category": "STARTER"
}, {
  "name": "Assortiment de Charcuteries",
  "categoryName": "Entrées",
  "category": "STARTER"
}, {"name": "Yaourts simples ou gourmands", "categoryName": "Desserts", "category": "DESERT"}, {
  "name": "Patisseries",
  "categoryName": "Desserts",
  "category": "DESERT"
}, {"name": "Entremets", "categoryName": "Desserts", "category": "DESERT"}, {
  "name": "Fruits",
  "categoryName": "Desserts",
  "category": "DESERT"
}], "__v": 0
}

var f = {
  "_id": ObjectId("562fed0194fbf81709c554ff"),
  "timestamp": 1445981441730,
  "userId": ObjectId("560d67948faf785735c3efcf"),
  "feedback": {
    "quizz": {
      "enjoyed_my_meal": 0
    }
    ,
    "dishes": [
      {
        "thrown": "2",
        "dish": {
          "feedback": [],
          "name": "salade",
          "categoryName": "Entree",
          "category": "STARTER"
        }
      }
    ]
  }
  ,
  "menuId": ObjectId("562c3589a89151d61fd1f6b4"),
  "__v": 0
};
var questions = {
  'food': [
    {
      'question': 'Serais-tu pret à reprendre ce plat la prochaine fois ?',
      'answers': {0: 'Oui', 1: 'Non ce n\'était pas bon', 2: 'Non je n\'aime pas ça'},
      'target': 'enjoyed_my_meal',
      'value': null
    },
    {
      'question': 'Comment était la préparation de ce plat ?',
      'answers': {0: 'Trop salé', 1: 'Trop sucré', 2: 'Trop huileux', 3: 'Trop fade', 4: 'Pas assez chaud'},
      'target': 'seasoning',
      'value': null
    }
  ],
  'context': [
    {
      'question': 'As-tu eu suffisamment de temps pour manger ?',
      'answers': {true: 'Oui', false: 'Non'},
      'target': 'enough_time_to_eat',
      'value': null
    },
    {
      'question': 'Avec qui as-tu mangé ?',
      'answers': {true: 'Seul', false: 'Avec des amis'},
      'target': 'ate_alone',
      'value': null
    },
    {
      'question': 'Est-ce que tu t\'es resservi ?',
      'answers': {true: 'Oui', false: 'Non'},
      'target': 'took_twice',
      'value': null
    },
    {
      'question': 'Est-ce que tu trouves le RU convivial ?',
      'answers': {true: 'Oui', false: 'Non'},
      'target': 'convivial_restaurant',
      'value': null
    }
  ],
  'specific': { // TODO
    // 'entree': {
    //   'question': 'Comment était la préparation de l\'entrée ?',
    //   'answers': {0: '', 1: 'Comme il faut', 2: ''},
    //   'target': 'cooking_appetizer',
    //   'value': null
    // },
    'plat': {
      'question': 'Comment était la préparation de ce plat ?',
      'answers': {0: 'Pas assez cuit', 1: 'Bien cuit', 2: 'Trop cuit'},
      'target': 'cooking',
      'value': null
    }
    // 'dessert': {
    //   'question': 'Comment était la préparation de ce plat ?',
    //   'answers': {0: 'Pas assez cuit', 1: 'Bien cuit', 2: 'Trop cuit'},
    //   'target': 'cooking',
    //   'value': null
    // }
  }
}

var menus = db.menus.find().toArray();
var feedbacks = db.menufeedbacks.find().toArray();
var restaurants = db.restaurants.find().toArray();

var restaurantById = {};
restaurants.forEach(function(r){
  restaurantById[r.id] = r;
});

var feedbackByMenuId = {};
feedbacks.forEach(function(f){
  feedbackByMenuId[f.menuId] = f;
});

var menuByMenuId = {};
menus.forEach(function(m){
  menuByMenuId[m._id] = m;
});



var results = [];
feedbacks.forEach(function(f){
var feedbackByMenuId = {};
  feedbackByMenuId[f.menuId] = f;

  var menu = menuByMenuId[f.menuId];
  if (menu) {
    var ru = restaurantById[menu.idRestaurant];
    var row = {
      ru: ru.title,
      repas: menu.name,
      date: menu.date,
      timeFeedback: f.timestamp,
      feedback: f.feedback.quizz,
      dishes: f.feedback.dishes,
      iduser: f.userId
    };
    results.push(row);
  }
});



var printResults=function(results){
  results.forEach(function(row){
    print(row.ru, ";",
      row.repas, ";",
      row.date, ";",
      new Date(row.timeFeedback).toISOString(), ";",
      row.iduser, ";",
      JSON.stringify(row.feedback), ";",
      JSON.stringify(row.dishes))
  })
}

printResults(results);
