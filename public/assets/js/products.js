var products = [];
var categories = {};
var suppliers = {};

function uploadImage() {
    var fileUploadControl = $("#exampleInputFile")[0];
    if (fileUploadControl.files.length > 0) {
        var file = fileUploadControl.files[0];
        var parseFile = new Parse.File(file.name.replace(/[^a-zA-Z0-9 ]/g, ' '), file);
        return parseFile.save();
    }
    return Promise.resolve(undefined);
}

function checkProduct() {
    if ( $( "#exampleModalLabel" ).data( "product" ) !== undefined ) { // add
        return Promise.resolve({});
    }
    var code = $( "#productBarCodeInput" ).val();
    return new Parse.Query("Product").equalTo("code", code).count().then(c => {
        if (c > 0) {
            throw Error("Product with this code already exist");
        }
        return {};
    });
}

// Bindings
$( "#modal-form" ).on( "submit", function( e ) {
    e.preventDefault();
    $( "#progress" ).show();
    checkProduct().then(function() {
        return uploadImage().then(function(file) {
            var product;
            if ( $( "#exampleModalLabel" ).data( "product" ) !== undefined ) {
                product = $( "#exampleModalLabel" ).data( "product" );
            } else {
                var Product = Parse.Object.extend( "Product" );
                product = new Product();
            }
    
            file && product.set( "image", file );
            product.set( "withPreorder", false );
            $( "#modal-form" ).serializeArray().forEach( function( element ) {
                switch (element.name) {
                    case "supplier":
                        product.set( "supplier", suppliers[element.value] );
                        break;
                    case "category":
                        product.set( "category", categories[element.value] );
                        break;
                    case "withPreorder":
                        product.set( "withPreorder", $( "#withPreorderInput" ).prop( "checked" ) );
                        break;
                    default:
                        product.set( element.name, element.value );
                }
            } );
            
            $( "#addProductModal" ).modal( "hide" );
            return product.save();
        });
    })
    .then( reload )
    .catch( showError );
} );

function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
            $("#product-image").attr("src", e.target.result);
      }
      reader.readAsDataURL(input.files[0]);
    }
  }

$( "#exampleInputFile" ).on("change", function() {
    readURL(this);
})

$( "#addproductBtn" ).click( function() {
    $( "#exampleModalLabel" ).removeData( "product" );
    $( "#modal-form input" ).val( "" );
    $( "#modal-form select" ).val( "" );
    $( "#modal-form textarea" ).val( "" );
    $( "#exampleModalLabel" ).text( "Add Product" );
} );

$( "#product-image" ).on("load", function() {
    $( "#img-progress" ).hide();
});

$( "#btn-save" ).click( function () {
    $( "#modal-form" ).submit();
} );

$( "nav .form-inline input" ).val( getParameterByName( "search" ) );

$( "table tbody" ).click( function( e ) {
    var el = $( e.target );

    if ( el.data( "productedit" ) !== undefined ) {
        var product = products[ Number( el.data( "productedit" ) ) ];
        $( "#exampleModalLabel" ).text( "Edit Product" );
        $( "#exampleModalLabel" ).data( "product", product );
        $( "#productNameInput" ).val( product.get( "name" ) );
        $( "#productPriceInput" ).val( product.get( "price" ) );
        $( "#productQuantityInput" ).val( product.get( "quantity" ) );
        $( "#productDescriptionInput" ).val( product.get( "description" ) );
        $( "#productAdditionalInfoInput" ).val( product.get( "additionalInfo" ) );
        $( "#productBarCodeInput" ).val( product.get( "code" ) );
        $( "#productSupplierCodeInput" ).val( product.get( "supplierCode" ) );
        product.get( "category" ) && $( "#productCatInput" ).val( product.get( "category" ).id );
        product.get( "supplier" ) && $( "#productSupplierInput" ).val( product.get( "supplier" ).id );
        product.get( "category" ) || $( "#productCatInput" ).val( null );
        product.get( "supplier" ) || $( "#productSupplierInput" ).val( null );
        $( "#productMinQuantityInput" ).val( product.get( "threshold" ) );
        $( "#withPreorderInput" ).prop( "checked", !!product.get( "withPreorder" ) );
        $( "#exampleInputFile" ).val("");
        if (product.get("image")) {
            $( "#product-image" ).prop( "src", product.get("image").url() );
            $( "#img-progress" ).show();
        } else {
            $( "#product-image" ).prop( "src", "" );
            $( "#img-progress" ).hide();
        }
        $( "#addProductModal" ).modal( {} );
    }

    if ( el.data( "productdelete" ) !== undefined ) {
        $( "#deleteModal" ).modal();
        $( "#deleteModal .btn-danger" ).data( "object", products[ Number( el.data( "productdelete" ) ) ] );
    }
} );

// Init

Promise.all([
    new Parse.Query( "Category" ).ascending("name").find(function(_categories) {
        $( "#productCatInput" ).html( _categories.map( function( category ) {
            categories[category.id] = category;
            return `
                <option value="${category.id}">${category.get("name")}</option>
            `;
        } ).join( "" ) );
    }),
    new Parse.Query( "Supplier" ).ascending("name").find(function(_suppliers) {
        $( "#productSupplierInput" ).html( _suppliers.map( function( supplier ) {
            suppliers[supplier.id] = supplier;
            return `
                <option value="${supplier.id}">${supplier.get("name")}</option>
            `;
        } ).join( "" ) );
    })
]).then(function() {
    var search = getParameterByName( "search" );
    if ( !search ) {
        new Parse.Query( "Product" ).ascending("name").include("category").include("supplier").find().then( init ).catch( showError );
    } else {
        var nameQuery = new Parse.Query( "Product" ).matches( "name", search )
        var codeQuery= new Parse.Query( "Product" ).equalTo( "code", search );
        var supplierCodeQuery = new Parse.Query( "Product" ).equalTo( "supplierCode", search );
        var descriptionQuery = new Parse.Query( "Product" ).matches( "description", search );
        Parse.Query.or( nameQuery, codeQuery, supplierCodeQuery, descriptionQuery ).ascending("name").find().then( init ).catch( showError );
    }
})
.catch( showError );

function init( _products ) {
    products = _products;
    var perPage = 20;
    var pages = Math.ceil( products.length / perPage );
    var page = 1;

    if ( pages > 1 ) {
        for ( var i = 2; i <= pages; i++ ) {
            $( "ul.pagination li:last-child" ).before( $( `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            ` ) );
            $( "ul.pagination li:last-child" ).removeClass( "disabled" );
        }
    }

    $( "ul.pagination" ).click( function( e ) {
        e.preventDefault();

        var el = $( e.target );
        if ( el.parent().hasClass( "active" ) || el.data( "page" ) === undefined ) {
            return;
        }
        
        if ( el.data( "page" ) === "prev" && page > 1 ) {
            page -= 1;
        } else if ( el.data( "page" ) === "next" && page < pages ) {
            page += 1;
        } else {
            page = Number( el.data( "page" ) );
        }

        if ( page === 1 ) {
            $( "ul.pagination li:first-child" ).addClass( "disabled" );
        } else {
            $( "ul.pagination li:first-child" ).removeClass( "disabled" );
        }
        if ( page === pages ) {
            $( "ul.pagination li:last-child" ).addClass( "disabled" );
        } else {
            $( "ul.pagination li:last-child" ).removeClass( "disabled" );
        }

        $( "ul.pagination .active" ).removeClass( "active" );
        $( `ul.pagination a[data-page="${page}"]` ).parent().addClass( "active" );

        var start = ( page - 1 ) * perPage;
        renderProducts( products.slice( start, start + perPage ), start );
        $( "html, body" ).animate( { scrollTop: $( document ).height() }, "fast" );
    } );

    renderProducts( products.slice( 0, perPage ), 0 );

    $( "#progress" ).hide();
}

function renderProducts( products, start ) {
    let html = products.map( function( p, i ) {
        return (`
            <tr>
                <th scope="row">${i+1}</th>
                <td>${p.get( "name" )}</td>
                <td>${p.get( "code" )}</td>
                <td>${p.get( "category" ) ? p.get( "category" ).get("name") : ""}</td>
                <td>${p.get( "quantity" )}</td>
                <td>${p.get( "price" )}</td>
                <td>
                    <button type="button" class="btn btn-primary" data-productedit="${start+i}">Edit</button>
                    <button type="button" class="btn btn-primary" data-productdelete="${start+i}">Delete</button>
                </td>
            </tr>
        `)
    } );
    $( "table tbody" ).html( html.join( "" ) );
}
