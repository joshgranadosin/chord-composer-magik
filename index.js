// imported libraries
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var app = express();

// database connection
var mongodbURI = process.env.MONGODB_URI || 'mongodb://localhost/ccmagik';
mongoose.connect(mongodbURI);

// models
// var User = require('./models/user');
// var Sheet = require('./models/sheet');

// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// routing protection
//app.use('/songsheet/', expressJWT({secret: secret}));

// login route
app.post('/login', function(req,res){
	console.log('http POST at /login');
});

// signup route
app.post('/signup', function(req,res){
	console.log('http POST at /signup');
});

// logout route
app.delete('/logout', function(req,res){
	console.log('http DELETE at /logout');
});

// songsheet index
app.get('songsheet/', function(req,res){
	console.log('http GET at songheet/ - songsheet index')
});

app.get('songsheet/:id', function(req,res){
	console.log('http GET at /songsheet/' + req.params.id + ' - songsheet show');
});

app.post('songsheet', function(req,res){
	console.log('http POST at /songsheet');
});

app.put('songsheet/:id', function(req,res){
	console.log('http PUT at /songsheet/' + req.params.id);
});

app.delete('songsheet/:id', function(req,res){
	console.log('http DELETE at /songsheet/' + req.params.id);
});

// login main page
app.get('/*', function(req,res){
	res.sendFile('./public/index.html');
});