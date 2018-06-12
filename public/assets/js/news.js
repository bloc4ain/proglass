var newsArray = [];

$( "#modal-form" ).on( "submit", function( e ) {
    e.preventDefault();
    var news;
    if ( $( "#exampleModalLabel" ).data( "news" ) !== undefined ) {
        news = $( "#exampleModalLabel" ).data( "news" );
    } else {
        var News = Parse.Object.extend( "News" );
        news = new News();
    }
    $( "#modal-form" ).serializeArray().forEach( function( element ) { news.set( element.name, element.value ); } );
    $( "#addNewsModal" ).modal( "hide" );
    $( "#progress" ).show();
    news.save().then( reload ).catch( showError );
} );

$( "#addNewsBtn" ).click( function() {
    $( "#exampleModalLabel" ).removeData( "news" );
    $( "#modal-form input" ).val( "" );
    $( "#modal-form select" ).val( "" );
    $( "#modal-form textarea" ).val( "" );
    $( "#exampleModalLabel" ).text( "Add News" );
} );

$( "#btn-save" ).click( function () {
    $( "#modal-form" ).submit();
} );

$( "table tbody" ).click( function( e ) {
    var el = $( e.target );

    if ( el.data( "newsedit" ) !== undefined ) {
        var news = newsArray[ Number( el.data( "newsedit" ) ) ];
        $( "#exampleModalLabel" ).text( "Edit News" );
        $( "#exampleModalLabel" ).data( "news", news );
        $( "#newsTitleInput" ).val( news.get( "title" ) );
        $( "#newsContentInput" ).val( news.get( "content" ) );
        $( "#addNewsModal" ).modal( {} );
    }

    if ( el.data( "newsdelete" ) !== undefined ) {
        $( "#deleteModal" ).modal();
        $( "#deleteModal .btn-danger" ).data( "object", newsArray[ Number( el.data( "newsdelete" ) ) ] );
    }
} );

// Init
new Parse.Query( "News" ).ascending("createdAt").find().then( init ).catch( showError );

function init( _news ) {
    newsArray = _news;
    renderNews();
    $( "#progress" ).hide();
}

function renderNews() {
    let html = newsArray.map( function( s, i ) {
        return (`
            <tr>
                <th scope="row">${i+1}</th>
                <td>${s.get( "title" ) || ""}</td>
                <td>${s.get( "content" ) || ""}</td>
                <td><button type="button" class="btn btn-primary" data-newsedit="${i}">Edit</button>
                <button type="button" class="btn btn-primary" data-newsdelete="${i}">Delete</button></td>
            </tr>
        `)
    } );
    $( "table tbody" ).html( html.join( "" ) );
}
