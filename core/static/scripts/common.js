
var ref = new Firebase("https://luminous-heat-6147.firebaseio.com/");

var authData = ref.getAuth();

if (authData !== null)
	document.getElementById("user-id").innerText = authData.uid;

