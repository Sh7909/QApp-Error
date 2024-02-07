const express = require("express");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const connectensurelogin = require('connect-ensure-login');
const { saveData, finddata, submitQuote, getdata } = require('./mongo1.js');
const { model1 } = require('./mongo.js');
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');

const app = express();

app.use(express.static("public"));
app.use(session({
    secret: "s#@123",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }
}));
app.use(passport.initialize());
passport.use(model1.createStrategy());
app.use(passport.session());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cookieparser());
app.set("view engine", "ejs");
passport.serializeUser(model1.serializeUser());
passport.deserializeUser(model1.deserializeUser())
passport.use(new LocalStrategy({
    usernameField: 'eid2',
    passwordField: 'pass2'
  },
  async (username, password, done) => {
    try {
      const finduser = await finddata(username, password);
      if (finduser === true) {
        return done(null, { username, password });
      }
      return done(null, false, { message: 'Incorrect username or password' });
    } catch (err) {
      return done(err);
    }
  }
));

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/register', (req, res) => {
    res.render("register");
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.get('/quote', (req, res) => {
    res.render("createquote");
});

app.get('/posted_quotes', (req, res) => {
    res.render("quote");
});

app.get('/loginsuccess', connectensurelogin.ensureLoggedIn(), (req, res) => {
    console.log("Login Success", req.user); // req.user contains the authenticated user details
    res.render("logginsuccess");
});

app.get('/logout', (req, res) => {
    res.clearCookie();
    res.redirect('/');
});

app.post('/submit1', async (req, res) => {
    console.log("submit 1 called");
    console.log(req.body, "req.body of submit1");
    const { eid1, pass1 } = req.body;
    await saveData(eid1, pass1);
    res.render("logginsuccess");
    

});

app.post('/submit2', passport.authenticate('local', { failureRedirect: '/login' }), async (req, res) => {
    console.log("Submit2 called");
    const { eid2, pass2 } = req.body;
    const finduser = await finddata(eid2, pass2);
    if (finduser === true) {
        res.redirect("/loginsuccess");
    }
});

app.post('/submit3', async (req, res) => {
    console.log("Submit3 called");
    const { post, color } = req.body;
    await submitQuote(post, color);
    const quotedata = await getdata(post, color);
    res.render("quote", { quotedata });
});

app.listen(3000, () => {
    console.log("Server Started");
});