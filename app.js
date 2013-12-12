
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

var app = express();


mongoose.connect('mongodb://slickgrid-backbone-node:slickgrid-backbone-node@ds059888.mongolab.com:59888/slickgrid-backbone-node');

mongoose.connection.on('open', function() {
    console.log('Connected to Mongoose');
});

var Schema = mongoose.Schema

var Product = new Schema({
    name : {type: String, trim: true},
    grapes : {type: String, trim: true},
    country : {type: String, trim: true},
    region : {type: String, trim: true},
    year : {type: String, trim: true},
    notes : {type: String, trim: true}
});
var Product = mongoose.model('Product', Product);

/*var product = new Product({
 name : 'Product Ten',
 grapes : 'Grenache / Syrah',
 country : 'France',
 region : 'Sothern Rhone',
 year : '2009',
 notes : 'Products detials will goes here ....................'
});

 product.save(function(err,data){
     if(err){
        console.log("Its error")
     }
     else
     {
        console.log("data saved");
        console.log(data);
     }
 });*/


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

// Get Lists
app.get('/api/products', function (req, res) {
    return Product.find(function (err, products) {
        if (!err) {
            return res.send(products);
        } else {
            return console.log(err);
        }
    });
});

// POST to CREATE
app.post('/api/products', function (req, res) {
    var todo;
    var product = new Product({
        name : req.body.name,
        grapes : req.body.grapes,
        country : req.body.country,
        region : req.body.region,
        year : req.body.year,
        notes : req.body.notes
    });
    product.save('save', function (err, next) {
        if (!err) {
            return console.log("created");
        } else {
            return console.log(err);
        }
        next();
    });
    return res.send(product);
});

// remove a single product
app.delete('/api/products/:id', function (req, res) {
    return Product.findById(req.params.id, function (err, product) {
        return product.remove(function (err) {
            if (!err) {
                console.log("removed");
                return res.send(req.params.id);
            } else {
                console.log(err);
            }
        });
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
