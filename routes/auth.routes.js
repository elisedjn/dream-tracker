const express = require('express');
const router = express.Router();
const UserModel = require('../models/User.model.js')
const bcryptjs = require('bcryptjs')


// Sign Up page
router.get('/signup', (req, res) => {
  res.render('auth/signup.hbs')
});

router.post('/signup', (req, res) => {
  const {username, email, password} = req.body

  if(!username || !email || !password) {
      res.status(500).render('auth/signup.hbs', {errorMessage: 'Please enter all details'})
  };

  const emailReg = new RegExp(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)
  if (!emailReg.test(email)){
    res.status(500).render('auth/signup.hbs', {errorMessage: 'Please enter valid email'})
    return;
  };

  const passReg = new RegExp(/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,}$/)
  if(!passReg.test(password)) {
     res.status(500).render('auth/signup.hbs', {errorMessage: 'Password must be 6 characters and must have a number and a string'})
     return;
  };


  bcryptjs.genSalt(10)
      .then((salt) => {
          bcryptjs.hash(password, salt)
          .then((hashPass) => {
              UserModel.create({username, email, passwordHash: hashPass})
                  .then(()=>{
                      res.redirect('/')
                  });
          });
      });
});

// Login Page
router.get('/login', (req, res) => {
  res.render('auth/login.hbs')
});

router.post('/login', (req, res) => {
  const {email, password} = req.body

  if(!email || !password) {
      res.status(500).render('auth/login.hbs', {errorMessage: 'Please enter all details'})
  };
  
  UserModel.findOne({email: email})
      .then((userData) => {

          let doesItMatch = bcryptjs.compareSync(password, userData.passwordHash);

          if(doesItMatch) {
              console.log(req.session)
              req.session.loggedInUser = userData
              res.redirect('/record')
          } else {
              res.status(500).render('auth/login.hbs', {errorMessage: 'Passwords do not match'})
          };
      });
});


// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'))
});


module.exports = router;