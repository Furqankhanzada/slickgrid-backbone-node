
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

var SlickGridList = new Schema({
    title : {type: String, required: true, trim: true},
    duration : {type: String, trim: true},
    complete : {type: Number, trim: true},
    start : {type: Date},
    finish : {type: Date },
    effort_driven : {type: Boolean }
});
var List = mongoose.model('List', SlickGridList);

/*
var list = new List({
    title : 'Task 10',
    duration : '19 Days',
    complete : 79,
    start : '02/02/2009',
    finish : '02/08/2009',
    effort_driven : false
});

list.save(function(err,data){
     if(err){
        console.log("Its error")
     }
     else
     {
        console.log("data saved");
        console.log(data);
     }
 });
*/


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
app.get('/api/lists', function (req, res) {
    return List.find(function (err, lists) {
        if (!err) {
            return res.send(lists);
        } else {
            return console.log(err);
        }
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
