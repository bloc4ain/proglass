var newsArray = [];

$( "#modal-form" ).on( "submit", function( e ) {
    e.preventDefault();
    var arr = [];
    $( "#exampleSelect2 option:selected" ).each(function(i, e) {
        arr.push($(e).data('product').set("topselling", true).save());
    });
    $( "#progress" ).show();
    Promise.all(arr).then( reload ).catch( showError );
} );

$( "#addSupplierBtn" ).click( function() {
    $( "#exampleSelect2" ).val( "" );
} );

$( "#btn-save" ).click( function () {
    $( "#modal-form" ).submit();
} );

$( "table tbody" ).click( function( e ) {
    var el = $( e.target );
    if ( el.data( "newsdelete" ) !== undefined ) {
        $( "#deleteModal1" ).modal();
        $( "#deleteModal1 .btn-danger" ).data( "object", newsArray[ Number( el.data( "newsdelete" ) ) ] );
    }
} );

$( "#deleteModal1 .btn-danger" ).click( function() {
    $( ".progress" ).show();
    $( this ).data( "object" ).set("topselling", false).save().then( reload ).catch( showError );
} );

// Init
new Parse.Query( "Product" ).ascending("name").find().then(function(result) {
    init(result.filter(function(p) {
        return p.get("topselling");
    }));
    
    result.filter(function(p) {
        return !p.get("topselling");
    }).forEach(function(p) {
        var val = p.get("name") + " [" + p.get("code") + "]";
        var opt = $( "<option>" + val + "</option>" );
        opt.data("product", p);
        opt.appendTo("#exampleSelect2");
    });
}).catch( showError );

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
                <td>${s.get( "name" )}</td>
                <td>${s.get( "code" )}</td>
                <td><button type="button" class="btn btn-primary" data-newsdelete="${i}">Delete</button></td>
            </tr>
        `)
    } );
    $( "table tbody" ).html( html.join( "" ) );
}
