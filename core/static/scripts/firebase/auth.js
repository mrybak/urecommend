
var ref = new Firebase("https://luminous-heat-6147.firebaseio.com/");

$(document).ready(function () {

    $("#login-btn").click(function () {
        ref.authWithOAuthPopup("facebook", function(error, authData) {
            if (authData) {
                window.location.replace("/");
                ref.child('users').child(authData.uid).set(authData);
            }
        });
    });

    $("#logout-link").click(function () {
        ref.unauth();
        window.location.replace("/login");
    })

});
