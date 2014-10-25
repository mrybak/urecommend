(function() {
var ref = new Firebase("https://luminous-heat-6147.firebaseio.com/");

function prepareUser(userData) {
    var properties = {
        'points': 0
    };

    return $.extend({}, userData, properties);
}

$(document).ready(function () {

    $("#login-btn").click(function () {
        ref.authWithOAuthPopup("facebook", function(error, authData) {
            if (authData) {
                window.location.replace("/");
                authData = prepareUser(authData);
                
                ref.child('users/' + authData.uid).once('value', function (snap) {
                    if (snap.val() === null) {
                        ref.child('users').child(authData.uid).set(authData);
                    }
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
