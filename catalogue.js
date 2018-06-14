// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var Parse = require('parse/node');
var path = require('path');

Parse.initialize("myAppId");
Parse.serverURL = 'http://localhost:1337/parse';

// new Parse.Query( "News" ).descending("createdAt").find(console.log);

var app = express();

app.set('view engine', 'ejs');
app.set('views', './public/catalogue/pages');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public/catalogue')));

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
    Promise.all([
        new Parse.Query( "Opinions" ).descending("createdAt").find(),
        new Parse.Query( "News" ).descending("createdAt").find(),
        new Parse.Query( "Product" ).equalTo("topselling", true).ascending("updatedAt").find(),
        new Parse.Query( "Opinions" ).ascending("updatedAt").find(),
    ]).then(([opinions, news, ts, op]) => {
        res.render('home', {
            news: news.map(n => n.toJSON()),
            opinions: opinions.map(o => o.toJSON()),
            topSelling: ts.map(o => o.toJSON()),
            opinions: op.map(o => o.toJSON())
        });
    }).catch(err => {
        console.log(err)
        res.render('home', {
            news: [],
            opinions: [],
            topSelling: []
        });
    });
});

app.get('/catalogue', async function (req, res) {
    var categories = await new Parse.Query( "Category" ).find();
    
    var query;
    if (req.query.kw) {
        currentPage = 1;
        var nameQuery = new Parse.Query( "Product" ).matches( "name", new RegExp(req.query.kw, "i") )
        var codeQuery= new Parse.Query( "Product" ).equalTo( "code", req.query.kw );
        var supplierCodeQuery = new Parse.Query( "Product" ).equalTo( "supplierCode", req.query.kw );
        var descriptionQuery = new Parse.Query( "Product" ).matches( "description", req.query.kw );
        query = Parse.Query.or( nameQuery, codeQuery, supplierCodeQuery, descriptionQuery );
    } else {
        query = new Parse.Query( "Product" );
    }
    if (req.query.cat) {
        query.equalTo("category", { "__type": "Pointer", "className": "Category", "objectId": req.query.cat });
    }
    var count = await query.count();
    var perPage = 20;
    var pages = Math.ceil(count / perPage);
    var currentPage = Math.min(Math.max(Number(req.query.page) || 1, 1), pages);

    var result = await query.ascending("name").skip(Math.max(0, (currentPage - 1) * perPage)).limit(perPage).find();
    // console.log(result.map(r => r.toJSON()))
    res.render('catalogue', {
        products: result.map(r => r.toJSON()),
        page: currentPage,
        pages: new Array(pages).fill(0).map((r, i) => i + 1),
        categories: categories.map(c => c.toJSON()),
        kw: req.query.kw,
        cat: req.query.cat
    });
});

app.get('/contact', function (req, res) {
    res.render('contact', {message: ''});
});

app.post('/contact', function (req, res) {
    var Email = Parse.Object.extend("Email");
    var email = new Email();
    if (!req.body.email ||
        !req.body.name ||
        !req.body.address ||
        !req.body.subject ||
        !req.body.text) {
        res.render('contact', {message: 'Missing form information'});
        return;
    }
    email.set('email', req.body.email);
    email.set('name', req.body.name);
    email.set('address', req.body.address);
    email.set('subject', req.body.subject);
    email.set('text', req.body.text);
    email.save().then(() => {
        res.render('contact', {message: 'Your message was posted successfully and we will reply to you as soon as we process it!'});
    }).catch(error => {
        res.render('contact', {message: error.toString()});
    });
});

var port = process.env.CPORT || 1338;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
});
