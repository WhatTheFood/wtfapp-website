var FB = require('fb');

exports.updateUserBasicInfos = function(user, callback) {

    //token = "CAAIMhwO1ZCbsBAGNSczxzT6gPODvhvsNc7yw68hcDrIX2rSwSexl5sL63HfT8ZBtZBPxl42wquqZAUqwnGj0arKcbiP1kRlsCNdhCSuVDh6ErheEPV3vXSLanHXaZCkvWyJxAGMOhOtjTThn4fx1ZBZCTnsL2VlPUDYPPWhhGC4DRUFBo4XHcTLMZCuLp7LOm0AHKltZB6NYD5OhZB7ZC00h5IF1Nsj7rUqlO8ZD";
    token = user.facebook_token;

    FB.api('me',
        {
            fields: ['id', 'first_name', 'last_name'],
            access_token: token
        },
        function (res) {
        if (res && res.error) {
            if(res.error.code === 'ETIMEDOUT') {
                console.log('request timeout');
            }
            else {
                console.log('error', res.error);
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

            console.log("============================================")
            console.log(user);

            user.save(function(err) {
                if (err) {
                    console.log("ERROR:" + err);
                    // TODO handle properly
                }
                else {
                    callback(user);
                }
            });
        }
    })

}

exports.getUserFacebookFriends = function(user, callback) {

    //token = "CAAIMhwO1ZCbsBAGyZBkDzux8PnuDVAQzOCDrwsa92Hp5bEZA2dtXcygYSqfQxrK0swXJfjhdtpbMOvFEXMncNliZCk95zXYbuxZAgb0vWq4f3cRMGvcuIJ8uWXb5JrzOZAKQB7mhXiTsg5gjZBZAZAVsyUk2tUDPfemZBFVXdERvgiQ9FrFmgrSjkMniRptGq9vFpU63SQPMCSn7EWk6KPVTZAgwT3YLekNcgQZD";
    token = user.facebook_token;

    FB.api('/me/friends',
        {
            access_token: token
        },
        function (res) {
        if (res && res.error) {
            if(res.error.code === 'ETIMEDOUT') {
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
