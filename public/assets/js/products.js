var products = [];
var categories = {};
var suppliers = {};

$(window.frames["prt-labels"].document.head).append($('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB" crossorigin="anonymous">'));

function uploadImage(res) {
    var fileUploadControl = $("#exampleInputFile")[0];
    if (fileUploadControl.files.length === 0) {
        return Promise.resolve(undefined);
    }
    var formData = new FormData();
    formData.append('sampleFile', fileUploadControl.files[0]);

    return $.ajax({
        url : '/image/' + res.id,
        type : 'POST',
        data : formData,
        processData: false,  // tell jQuery not to process the data
        contentType: false  // tell jQuery not to set contentType
    }).then(function() {
        res.set('imgsrc', '/img/' + res.id);
        return res.save();
    });
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
        var product;
        if ( $( "#exampleModalLabel" ).data( "product" ) !== undefined ) {
            product = $( "#exampleModalLabel" ).data( "product" );
        } else {
            var Product = Parse.Object.extend( "Product" );
            product = new Product();
        }

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
    })
    .then(uploadImage)
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
    $( "#img-progress" ).hide();
    $( "#product-image" ).prop( "src", "" );
} );

$( "#product-image" ).on("load", function() {
    $( "#img-progress" ).hide();
});

$( "#btn-save" ).click( function () {
    $( "#modal-form" ).submit();
} );

$( "#print-labels-btn" ).click(function() {
    var company = 'PRO GLASS SERVICE LTD';
    var name = $( "#exampleModalLabel" ).data( "product" ).get("name");
    var code = $( "#exampleModalLabel" ).data( "product" ).get("code");
    var rows = [];
    for (var i = 0; i < 10; i++) {
        var cols = [];
        for (var j = 0; j < 4; j++) {
            cols.push($(`<div class="col">
                <p style="font-weight:bold;">${company}</p>
                <p>${name}</p>
                <p class="float-right">S№ ${code}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
            </div>`));
        }
        rows.push($(`<div class="row"></div>`).append(cols));
    }
    var cnt = $('<div class="container"></div>').append(rows);
    $(window.frames["prt-labels"].document.body).empty();
    $(window.frames["prt-labels"].document.body).append(cnt);
    setTimeout(() => window.frames["prt-labels"].print(), 1000);
});

$( "#productPercentageInput,#productPriceInput" ).keyup(calcPrice);

function calcPrice() {
    var price = Number($( "#productPriceInput" ).val());
    var percentage = Number($( "#productPercentageInput" ).val());
    if (!isNaN(price) && !isNaN(percentage)) {
        var result = price * percentage / 100 + price;
        $( "#productResultPrice" ).val(parseFloat(result).toFixed(2));
    }
}

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
        $( "#productPercentageInput" ).val( product.get( "overprice" ) );
        product.get( "category" ) && $( "#productCatInput" ).val( product.get( "category" ).id );
        product.get( "supplier" ) && $( "#productSupplierInput" ).val( product.get( "supplier" ).id );
        product.get( "category" ) || $( "#productCatInput" ).val( null );
        product.get( "supplier" ) || $( "#productSupplierInput" ).val( null );
        $( "#productMinQuantityInput" ).val( product.get( "threshold" ) );
        $( "#withPreorderInput" ).prop( "checked", !!product.get( "withPreorder" ) );
        $( "#exampleInputFile" ).val("");
        calcPrice();
        if (product.get("imgsrc")) {
            $( "#product-image" ).prop( "src", product.get("imgsrc") );
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
        $( "#productCatInput1" ).html( `
            <option selected value>Select category</option>
            <option>No Category</option>
        ` + _categories.map( function( category ) {
            categories[category.id] = category;
            return `
                <option value="${category.id}">${category.get("name")}</option>
            `;
        } ).join( "" ) );
        $( "#productCatInput1" ).val( getParameterByName("category") );
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
    var query;
    if ( !search ) {
        query = new Parse.Query( "Product" );
    } else {
        var nameQuery = new Parse.Query( "Product" ).matches( "name", new RegExp(search, "i") )
        var codeQuery= new Parse.Query( "Product" ).equalTo( "code", search );
        var supplierCodeQuery = new Parse.Query( "Product" ).equalTo( "supplierCode", search );
        var descriptionQuery = new Parse.Query( "Product" ).matches( "description", new RegExp(search, "i") );
        query = Parse.Query.or( nameQuery, codeQuery, supplierCodeQuery, descriptionQuery );
    }
    var cat = getParameterByName("category");
    switch (cat) {
        case 'No Category':
            query.equalTo("category", null);
            break;
        case undefined:
        case null:
        case '':
            break;
        default:
            query.equalTo("category", { "__type": "Pointer", "className": "Category", "objectId": cat });
            break;
    }
    query.include("category").include("supplier").ascending("name").find().then( init ).catch( showError );
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

function getResPrice(p) {
    if (p.get('overprice')) {
        return parseFloat(Number(p.get('price')) * Number(p.get('overprice')) / 100 + Number(p.get('price'))).toFixed(2);
    } else {
        return parseFloat(Number(p.get('price'))).toFixed(2);
    }
}

function renderProducts( products, start ) {
    let html = products.map( function( p, i ) {
        return (`
            <tr>
                <th scope="row">${i+1}</th>
                <td>${p.get( "name" )}</td>
                <td><img style="max-width:40px; max-height:40px" src="${p.get( 'imgsrc' )}" /></td>
                <td>${p.get( "code" )}</td>
                <td>${p.get( "category" ) ? p.get( "category" ).get("name") : ""}</td>
                <td>${p.get( "quantity" )}</td>
                <td>${getResPrice(p)}</td>
                <td>
                    <button type="button" class="btn btn-primary" data-productedit="${start+i}">Edit</button>
                    <button type="button" class="btn btn-primary" data-productdelete="${start+i}">Delete</button>
                </td>
            </tr>
        `)
    } );
    $( "table tbody" ).html( html.join( "" ) );
}
