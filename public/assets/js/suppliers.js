var suppliers = [];

$( "#modal-form" ).on( "submit", function( e ) {
    e.preventDefault();
    var supplier;
    if ( $( "#exampleModalLabel" ).data( "supplier" ) !== undefined ) {
        supplier = $( "#exampleModalLabel" ).data( "supplier" );
    } else {
        var Supplier = Parse.Object.extend( "Supplier" );
        supplier = new Supplier();
    }
    $( "#modal-form" ).serializeArray().forEach( function( element ) { supplier.set( element.name, element.value ); } );
    $( "#addSupplierModal" ).modal( "hide" );
    $( "#progress" ).show();
    supplier.save().then( reload ).catch( showError );
} );

$( "#addSupplierBtn" ).click( function() {
    $( "#exampleModalLabel" ).removeData( "supplier" );
    $( "#modal-form input" ).val( "" );
    $( "#modal-form select" ).val( "" );
    $( "#modal-form textarea" ).val( "" );
    $( "#exampleModalLabel" ).text( "Add Supplier" );
} );

$( "#btn-save" ).click( function () {
    $( "#modal-form" ).submit();
} );

$( "table tbody" ).click( function( e ) {
    var el = $( e.target );

    if ( el.data( "supplieredit" ) !== undefined ) {
        var supplier = suppliers[ Number( el.data( "supplieredit" ) ) ];
        $( "#exampleModalLabel" ).text( "Edit Supplier" );
        $( "#exampleModalLabel" ).data( "supplier", supplier );
        $( "#supplierNameInput" ).val( supplier.get( "name" ) );
        $( "#supplierAddressInput" ).val( supplier.get( "address" ) );
        $( "#supplierPhoneInput" ).val( supplier.get( "phone" ) );
        $( "#supplierInfoInput" ).val( supplier.get( "info" ) );
        $( "#supplierEmailInput" ).val( supplier.get( "email" ) );
        $( "#addSupplierModal" ).modal( {} );
    }

    if ( el.data( "supplierdelete" ) !== undefined ) {
        $( "#deleteModal" ).modal();
        $( "#deleteModal .btn-danger" ).data( "object", suppliers[ Number( el.data( "supplierdelete" ) ) ] );
    }
} );

// Init
new Parse.Query( "Supplier" ).ascending("name").find().then( init ).catch( showError );

function init( _suppliers ) {
    suppliers = _suppliers;
    renderSuppliers();
    $( "#progress" ).hide();
}

function renderSuppliers() {
    let html = suppliers.map( function( s, i ) {
        return (`
            <tr>
                <th scope="row">${i+1}</th>
                <td>${s.get( "name" ) || ""}</td>
                <td>${s.get( "address" ) || ""}</td>
                <td>${s.get( "phone" ) || ""}</td>
                <td>${s.get( "info" ) || ""}</td>
                <td><button type="button" class="btn btn-primary" data-supplieredit="${i}">Edit</button>
                <button type="button" class="btn btn-primary" data-supplierdelete="${i}">Delete</button></td>
            </tr>
        `)
    } );
    $( "table tbody" ).html( html.join( "" ) );
}
