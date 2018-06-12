var categories = [];

$( "#modal-form" ).on( "submit", function( e ) {
    e.preventDefault();
    var category;
    if ( $( "#exampleModalLabel" ).data( "category" ) !== undefined ) {
        category = $( "#exampleModalLabel" ).data( "category" );
    } else {
        var Category = Parse.Object.extend( "Category" );
        category = new Category();
    }
    $( "#modal-form" ).serializeArray().forEach( function( element ) { category.set( element.name, element.value ); } );
    $( "#addCategoryModal" ).modal( "hide" );
    $( "#progress" ).show();

    category.save().then( reload ).catch(showError);
} );

$( "#addCategoryBtn" ).click( function() {
    $( "#exampleModalLabel" ).removeData( "category" );
    $( "#modal-form input" ).val( "" );
    $( "#modal-form select" ).val( "" );
    $( "#modal-form textarea" ).val( "" );
    $( "#exampleModalLabel" ).text( "Add Category" );
} );

$( "#btn-save" ).click( function () {
    $( "#modal-form" ).submit();
} );

$( "table tbody" ).click( function( e ) {
    var el = $( e.target );

    if ( el.data( "categoryedit" ) !== undefined ) {
        var category = categories[ Number( el.data( "categoryedit" ) ) ];
        $( "#exampleModalLabel" ).text( "Edit Category" );
        $( "#exampleModalLabel" ).data( "category", category );
        $( "#categoryNameInput" ).val( category.get( "name" ) );
        $( "#addCategoryModal" ).modal( {} );
    }

    if ( el.data( "categorydelete" ) !== undefined ) {
        $( "#deleteModal" ).modal();
        $( "#deleteModal .btn-danger" ).data( "object", categories[ Number( el.data( "categorydelete" ) ) ] );
    }
} );

// Init
new Parse.Query( "Category" ).descending("createdAt").find().then( init ).catch(showError);

function init( _categories ) {
    categories = _categories;
    renderCategories();
    $( "#progress" ).hide();
}

function renderCategories() {
    let html = categories.map( function( s, i ) {
        return (`
            <tr>
                <th scope="row">${i+1}</th>
                <td>${s.get( "name" ) || ""}</td>
                <td><button type="button" class="btn btn-primary" data-categoryedit="${i}">Edit</button>
                <button type="button" class="btn btn-primary" data-categorydelete="${i}">Delete</button></td>
            </tr>
        `)
    } );
    $( "table tbody" ).html( html.join( "" ) );
}
