var FB = require('fb');

exports.updateUserBasicInfos = function(user) {

    //token = "CAAIMhwO1ZCbsBACf2TDfGLorzlre5UNGyS45TdYZChunl6nj59SIyrnx8T2ZAZBSXTLmrm6uhzYAOIHIsrZBSPdmz4naJa735sweZCb2mJFlgf3W8w5jiZAileuZBZC2P3F0euKyFfEx9Pt39bgvXWsdVZBZAZBBtf85DDqjSMxDeCE6yCZANrLDUtE80kC0OTM0jMu4VE5qTrGtqAKH0kKBMZBO0oB9QwN7dY1PkZD"
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
            console.log("============================================")
            console.log(res);
            user.set({
                'first_name': res.first_name,
                'last_name': res.last_name,
                'facebook_id': res.id,
                'avatar': "http://graph.facebook.com/" + res.id + "/picture",
            });

            user.save(function(err) {
                if (err) {
                    console.log("ERROR:" + err);
                    // TODO handle properly
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
