Parse.initialize( "myAppId" );
Parse.serverURL = "https://m.progls.com/parse";

function getParameterByName( name, url ) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$( "#deleteModal .btn-danger" ).click( function() {
    $( ".progress" ).show();
    $( this ).data( "object" ).destroy().then( reload ).catch( showError );
} );

function showError( error ) {
    $( "#errorModalLabel" ).text( error && error.toString() );
    $( ".progress" ).hide();
    $( "#errorModal" ).modal();
}

function reload() {
    window.location.reload();
}