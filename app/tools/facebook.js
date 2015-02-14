var FB = require('fb');

exports.updateUserBasicInfos = function(user) {

    token = "CAAIMhwO1ZCbsBADb2nT2ar7DuT4dbMA1vJz7Pr94olJfCiXpb6KTbYmq7dgChbd3fO9Yzk1JiEp9XznXiuhQwaDL4dLdhSE1phMes2CxkkW163pMO9FEagPT8OIMACTIwyK6azHPDKGfZBICS9ZBVoxxMrcixfRhMS0fKRvmNn1oYl8fD2P9EBZByLqC5OdTXBpfwzWxY05HMIujS0SZAZAaAmZCpbYYtYZD";

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
