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


////db.menus.update({"_id" : ObjectId("561f49fee70430d80aebd7b7"), "dishes.name":"salade", "dishes.feedbacks.uid": { $not: {$eq: "fel"} } }, { $push : { "dishes.$.feedbacks" : { uid: "fel"} } } );