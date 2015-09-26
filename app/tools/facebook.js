var FB = require('fb');

exports.updateUserBasicInfos = function (user, callback) {

  token = user.facebook_token;

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
          'facebook_id': res.id,
          'avatar': "http://graph.facebook.com/" + res.id + "/picture",
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

}

exports.getUserFacebookFriends = function (user, callback) {

  var token = user.facebook_token;

  FB.api('/me/friends',
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
}
