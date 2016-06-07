// imported libraries
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var app = express();

// database connection
var mongodbURI = process.env.MONGODB_URI || 'mongodb://localhost/ccmagik';
mongoose.connect(mongodbURI);

// models
var User = require('./models/user');
var Songsheet = require('./models/songsheet');

// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// routing protection
var secret = "isadalawatatlo";
app.use('/songsheet/', expressJWT({secret: secret}));

// login route
app.post('/login', function(req,res){
	console.log('http POST at /login');
  User.findOne({email: req.body.email}, function(err, user) {
    if (err || !user){
    	return res.json({err:err, message:"Email not found."});
   	}
    user.authenticated(req.body.password, function(err, result) {
      if (err || !result){
      	return res.json({err:err, message:"Password does not match our records."})
      }
      // make a token & send it as JSON
      var token = jwt.sign(user, secret);
      res.send({user: user, token: token});
    });
  });
});

// signup route
app.post('/signup', function(req,res){
	console.log('http POST at /signup');
  newUser = new User({
    email: req.body.email,
    password: req.body.password,
    songsheets: []
  });

  newUser.save(function(err,user){
    if(err){
      return res.json({err:err, message:"Unable to create user account"});
    }
    else {
      var token = jwt.sign(user, secret);
      res.send({user: user, token: token});      
    }
  })
});

// logout route
// app.delete('/logout', function(req,res){
// 	console.log('http DELETE at /logout');
// });

// songsheet index
app.get('songsheet/', function(req,res){
 	console.log('http GET at songheet/ - songsheet index');
  console.log(req.user);
});

app.get('songsheet/:id', function(req,res){
	console.log('http GET at /songsheet/' + req.params.id + ' - songsheet show');
  console.log(req.user);

});

app.post('songsheet', function(req,res){
	console.log('http POST at /songsheet');
  console.log(req.user);
});

app.put('songsheet/:id', function(req,res){
	console.log('http PUT at /songsheet/' + req.params.id);
  console.log(req.user);
});

app.delete('songsheet/:id', function(req,res){
	console.log('http DELETE at /songsheet/' + req.params.id);
  console.log(req.user);
});

// login main page
app.get('/*', function(req,res){
	res.sendFile('/index.html');
});

// app listen
app.listen(process.env.PORT || 3000);