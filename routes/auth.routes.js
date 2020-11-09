const express = require('express');
const router = express.Router();
const ensureLogin = require('connect-ensure-login');
const User = require('../models/User.model');

const bcrypt = require('bcrypt');
const passport = require('passport');
const bcryptSalt = 10;

function checkRoles(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      res.redirect('/login')
    }
  }
}

router.get('/login', (req, res, next) => {
  res.render('auth/login', {message: req.flash("error")})
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.render('auth/login');
});

router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
});

router.get('/users', ensureLogin.ensureLoggedIn(),(req, res, next) => {
  User.find()
    .then(users => {
      res.render('auth/users', {users});
    })
})

router.get('/add-user', checkRoles('BOSS'), (req, res, next) => {
  res.render('auth/add-user');
});

router.get('/delete/:id', checkRoles('BOSS'), (req, res, next) => {
  const userId = req.params.id;
  User.findByIdAndDelete(userId)
    .then(() => {
      res.redirect('/users')
    })
    .catch(e => {
      console.log(`Error deleting user: ${e}`);
      res.redirect('/users');
    })
});

router.post('/signup', (req, res, next) => {
  const {username, password} = req.body;

  if(username == "" || password == "") {
    res.render('auth/signup', {message: "Please enter a username & password"});
    return;
  }

  User.findOne({username})
    .then(user => {
      if(user !== null) {
        res.render('auth/signup', {message: "Username already exists!"});
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);
      const newUser = new User({username, password: hashPass});

      newUser.save()
        .then(user => {
          res.redirect('/');
        })
        .catch(e => {
          res.render('login', {message: "Error creating new user"})
        })
    })
});

router.post('/add-user', checkRoles('BOSS'), (req, res, next) => {
  const {username, password, role} = req.body;

  if(username == "" || password == "") {
    res.render('auth/add-user', {message: "Please enter a username & password"});
    return;
  }

  User.findOne({username})
    .then(user => {
      if(user !== null) {
        res.render('auth/add-user', {message: "Username already exists!"});
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);
      const newUser = new User({username, password: hashPass, role});

      newUser.save()
        .then(user => {
          res.redirect('/users');
        })
        .catch(e => {
          res.render('auth/add-user', {message: "Error creating new user"})
        })
    })
});

router.post('/login', passport.authenticate("local", {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true
}))

module.exports = router;
