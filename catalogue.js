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

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public/catalogue')));

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
    Promise.all([
        new Parse.Query( "Opinions" ).descending("createdAt").find(),
        new Parse.Query( "News" ).descending("createdAt").find(),
    ]).then(([opinions, news]) => {
        res.render('home', {
            news: news.map(n => n.toJSON()),
            opinions: opinions.map(o => o.toJSON()),
            topSelling: []
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

app.get('/catalogue', function (req, res) {
    res.render('catalogue', { title: 'Hey', message: 'Hello there!' })
});

var port = process.env.CPORT || 1338;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
});
