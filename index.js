// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var fileUpload = require('express-fileupload');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
    databaseURI: databaseUri || 'localhost:27017/proglass',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: process.env.APP_ID || 'myAppId',
    masterKey: process.env.MASTER_KEY || '123123', //Add your master key here. Keep it secret!
    serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
    liveQuery: {
        // classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
    }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/img', express.static(path.join(__dirname, '/img')));

app.use(fileUpload());

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// // Parse Server plays nicely with the rest of your web routes
// app.get('/', function (req, res) {
//     res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
// });

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/dashboard.html'));
});

app.get('/categories', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/categories.html'));
});

app.get('/news', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/news.html'));
});

app.get('/products', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/products.html'));
});

app.get('/suppliers', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/suppliers.html'));
});

app.get('/opinions', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/opinions.html'));
});

app.get('/topselling', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/topselling.html'));
});

app.get('/post', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/post.html'));
});

app.post('/image/:name', function(req, res) {
    if (!req.files) return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(path.join(__dirname, 'img', req.params.name), function(err) {
        if (err) return res.status(500).send(err);
        res.send('File uploaded!');
    });
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
});

// // This will enable the Live Query real-time server
// ParseServer.createLiveQueryServer(httpServer);
