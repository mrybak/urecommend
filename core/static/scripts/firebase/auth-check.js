
var ref = new Firebase("https://luminous-heat-6147.firebaseio.com/");

var authData = ref.getAuth();

if (!authData) {
    alert('niezalogowan');
    window.location.replace("/login");
} else {
    alert('zalogowan');
}
