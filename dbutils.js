/**
 * Created by fel on 03/10/2015.
 */

host = db.serverStatus().host;
prompt = function(){
  return db+"@"+host+"$ ";
}

WTF = {
  updateRole: function(email,role){
    var user = db.users.findOne({email: email});
    user.role = role;
    db.users.save(user);
  },

  mkindexes: function () {
    db.restaurants.createIndex({id: 1});
    db.restaurants.createIndex( {coordinates: "2dsphere"} );
  }
};
