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
    	return res.status(401).json({
        err:err,
        message:"Email not found. Please check the spelling or create a new account"
      });
   	}
    user.authenticated(req.body.password, function(err, result) {
      console.log(err,result);
      if (err || !result){
        console.log(err,result);
      	return res.status(401).json({err:err, message:"Password does not match our records."})
      }
      // make a token & send it as JSON
      // I noticed that white/blacklisting is not working because it's sending the whole doc, forced method.
      var token = jwt.sign(user.toObject(), secret);
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
      console.log(err);
      if (err && (11000 === err.code || 11001 === err.code)) {
        return res.status(401).json({err:err, message:"That email is already in use."});
      }
      if (err.errors.email){
        return res.status(401).json({err:err, message:err.errors.email.message});
      }
      if (err.errors.password){
        // not sure why I'm not hitting this... must read mongoose docs
        return res.status(401).json({err:err, message:err.errors.password.message});
      }
      res.status(401).json({err:err, message:"Unable to create account."});
    }
    // make a token & send it as JSON
    // I noticed that white/blacklisting is not working because it's sending the whole doc, forced method.
    var token = jwt.sign(user.toObject(), secret);
    res.send({user: user, token: token});
  })
});

// songsheet index
app.get('/songsheet/', function(req,res){
 	console.log('http GET at songheet/ - songsheet index');
  console.log(req.user);

  User.findOne({email:req.user.email}, function(err, user){
    if (err || !user){
      console.log(err,user);
      return res.status(500).json({err:err, message:"Email not found."});
    }
    Songsheet.find({_creator: user._id}, function(err, data){
      if(err || !data){
        console.log(err,data);
        return res.status(500).json({err:err, message:"Unable to save document."});
      }

      var songlist = [];
      data.forEach(function(songsheet){
        var info = {
          title: songsheet.title,
          artist: songsheet.artist,
          _id: songsheet._id
        }
        songlist.push(info);
      });
      res.json(songlist);
    })
  })

});

app.get('/songsheet/:id', function(req,res){
	console.log('http GET at /songsheet/' + req.params.id + ' - songsheet show');
  console.log(req.user);

  Songsheet.findOne({_id: req.params.id}, function(err, doc){
    if(err || !doc){
      console.log(err,doc);
      return res.status(500).json({err:err, message:"Unable to find document."});
    }
    console.log(doc);
    res.json(doc);
  })
});

app.post('/songsheet', function(req,res){
	console.log('http POST at /songsheet');
  console.log(req.user);
  console.log(req.body);

  User.findOne({email:req.user.email}, function(err, user){
    if (err || !user){
      console.log(err);
      return res.status(500).json({err:err, message:"Email not found."});
    }
    newSongsheet = new Songsheet({
      title: req.body.title,
      artist: req.body.artist,
      _creator: user._id,
      chords: req.body.chords,
      data: req.body.data,
      tabs: req.body.tabs
    });

    newSongsheet.save(function(err, doc){
      if (err || !doc){
        console.log(err);
        return res.status(500).json({err:err, message:"Unable to save document."});
      }
      res.status(200).json({doc});
    });
  });

});

app.put('/songsheet/:id', function(req,res){
	console.log('http PUT at /songsheet/' + req.params.id);
  console.log(req.user);
  console.log(req.body);

  Songsheet.findByIdAndUpdate(req.params.id,
    {
      $set: {
        title: req.body.title,
        artist: req.body.artist,
        chords: req.body.chords,
        data: req.body.data,
        tabs: req.body.tabs
      }
    }, function (err, doc) {
      if (err) return handleError(err);
      res.status(200).json({doc});
    }
  );
});

app.delete('/songsheet/:id', function(req,res){
	console.log('http DELETE at /songsheet/' + req.params.id);
  console.log(req.user);

  Songsheet.findOneAndRemove({_id:req.params.id}, function(err, doc){
    console.log(err,doc);
    if(err){
      return res.status(500).json({doc});
    }
    res.status(200).json({doc});
  })
});

// about page
app.get('/about', function(req,res){
  res.sendFile(path.join(__dirname, 'public/documentation/about.html'));
});

// login main page
app.get('/*', function(req,res){
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

// app listen
app.listen(process.env.PORT || 3000);