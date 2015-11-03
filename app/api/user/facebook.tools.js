var FB = require('fb');
var Q = require('q');

exports.updateUserBasicInfos = function (user, callback) {

  token = user.fb.access_token;

  FB.api('me',
    {
      fields: ['id', 'first_name', 'last_name'],
      access_token: token
    },
    function (res) {
      if (res && res.error) {
        if (res.error.code === 'ETIMEDOUT') {
          console.log('request timeout');
          callback(false, "Request timeout")
        }
        else {
          console.log('error', res.error);
          callback(false, res.error);
        }
        return false;
      }
      else {
        user.set({
          'first_name': res.first_name,
          'last_name': res.last_name,
          'fb.id': res.id,
          'avatar': "http://graph.facebook.com/" + res.id + "/picture?width=300&height=300",
        });

        user.save(function (err) {
          if (err) {
            console.log("ERROR:" + err);
            // TODO handle properly
            callback(true, err);
          }
          else {
            callback(true, user);
          }
        });
      }
    })

};

exports.getUserFacebookFriends = function (user, callback) {

  var token = user.fb.access_token;
  FB.api('/me/friends?fields=picture',
    {
      access_token: token
    },
    function (res) {
      if (res && res.error) {
        if (res.error.code === 'ETIMEDOUT') {
          console.log('request timeout');
        }
        else {
          console.log('error', res.error);
        }
        return callback(res.error, null);
      }
      else {
        return callback(null, res);
      }
    })
};


exports.getUserFacebookFriendsPromised = function (token) {

  var d = Q.defer();
  d.resolve([])
  return d.promise;
  FB.api('/me/friends?fields=picture',
    {
      access_token: token
    },
    function (res) {
      if (res && res.error) {
        if (res.error.code === 'ETIMEDOUT') {
          console.log('request timeout');
        }
        else {
          console.log('error', res.error);
        }
        d.resolve( []);
      }
      else {
        d.resolve(res.data)
      }
    })

  return d.promise;
};


