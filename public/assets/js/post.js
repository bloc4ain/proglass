var posts = [];

$( "table tbody" ).click( function( e ) {
    var el = $( e.target );
    if ( el.data( "postdelete" ) !== undefined ) {
        $( "#deleteModal" ).modal();
        $( "#deleteModal .btn-danger" ).data( "object", posts[ Number( el.data( "postdelete" ) ) ] );
    }
    if ( el.data( "postview" ) !== undefined ) {
        var p = posts[ Number( el.data( "postview" ) ) ];
        $( "#exampleModalLabel" ).text(p.get("subject"));
        $( "#email-field" ).text(p.get("email"));
        $( "#name-field" ).text(p.get("name"));
        $( "#address-field" ).text(p.get("address"));
        $( "#text-field" ).text(p.get("text"));
        $( "#viewModal" ).modal();
    }
} );

// Init
new Parse.Query( "Email" ).ascending("createdAt").find().then( init ).catch( showError );

function init( _posts ) {
    posts = _posts;
    renderPosts();
    $( "#progress" ).hide();
}

function renderPosts() {
    let html = posts.map( function( s, i ) {
        return (`
            <tr>
                <th scope="row">${i+1}</th>
                <td>${s.get( "name" )}</td>
                <td>${s.get( "email" )}</td>
                <td>${s.get( "subject" )}</td>
                <td><button type="button" class="btn btn-primary" data-postview="${i}">View</button>
                <button type="button" class="btn btn-primary" data-postdelete="${i}">Delete</button></td>
            </tr>
        `)
    } );
    $( "table tbody" ).html( html.join( "" ) );
}
