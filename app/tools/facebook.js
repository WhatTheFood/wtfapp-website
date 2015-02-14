var FB = require('fb');

exports.getUserBasicInfos = function(token) {

    FB.api('me',
        {
            fields: ['id', 'first_name', 'last_name', 'avatar'],
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
        }
        else {
            console.log("============================================")
            console.log(res);
        }
    })

}
