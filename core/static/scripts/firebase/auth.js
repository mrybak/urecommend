(function() {
var ref = new Firebase("https://luminous-heat-6147.firebaseio.com/");

function prepareUser(userData) {
    var properties = {
        'points': 0,
        'tags': []
    };

    return $.extend({}, userData, properties);
}

$(document).ready(function () {

    $("#login-btn").click(function () {
        ref.authWithOAuthPopup("facebook", function(error, authData) {
            if (authData) {
                authData = prepareUser(authData);
                ref.child('users/' + authData.uid).once('value', function (snap) {
                    console.log('x');
                    if (snap.val() === null) {
                        ref.child('users').child(authData.uid).set(authData);
                    }
                    window.location.replace("/");
                });
            }
        });
    });

    $("#logout-link").click(function () {
        ref.unauth();
        window.location.replace("/login");
    })

});
})();
