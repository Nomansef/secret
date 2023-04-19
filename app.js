//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const rotate = require(__dirname + "/rotate.js");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");




const app =express();

app.use(session({
    secret: "Our Little Secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



app.use(express.static("public"));
app.use("/photos", express.static("photos"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://127.0.0.1/userDB", {useNewUrlParser: true});


const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    googleId: String,
    secret: String
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const  User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://www.example.com/auth/google/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", (req, res) => {
    //const rotate1 = rotate.forFirstimg();

    res.render("home");
})

app.get("/auth/google",
    passport.authenticate('google', {scope: ["profile"]})
);

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/secrets", (req, res) => {


    User.find({"secret": {$ne: null}}).then((foundUsers) => {
        
       res.render("secrets", {usersWithSecret: foundUsers});
        
    })
});

app.get("/submit", (req, res) => {
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.render("login");
    }
});

app.post("/submit", (req, res) => {
    const submittedSecret = req.body.secret;

     
    User.findById(req.user._id).then(function(foundUser) {

            if(foundUser){
                foundUser.secret = submittedSecret;
                foundUser.save();
                    res.redirect("/secrets");
                }
         }
        )
});
    


app.get("/logout", (req, res) => {

    req.logout(function(err) {
        if (err) { console.log(err); }
        res.redirect("/");
      });
});

app.post("/register", (req, res) => {

    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) { 
            console.log(err);
            res.redirect("/register");
         }else{
            const authenticate = User.authenticate();
            passport.authenticate("local")(req, res, function() {
              res.redirect("/secrets");
              // Value 'result' is set to false. The user could not be authenticated since the user is not active
            });
         }    
      });   
})

app.post("/login", (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function(err) {
        if(err) {
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    })
    
});





app.listen(3000, (req, res) => {
    console.log("Server started on port localhost 3000");
})