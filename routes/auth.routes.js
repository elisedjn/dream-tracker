const express = require('express');
const router = express.Router();
const UserModel = require('../models/User.model.js')
const DreamModel = require('../models/Dream.model.js')
const bcryptjs = require('bcryptjs')


//Configuration for Cloudinary and Recording
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer  = require('multer');
//require ('dotenv').config()
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
    });
    
    const storage = new CloudinaryStorage({
      cloudinary,
      folder: 'Records', // The name of the folder in cloudinary
      allowedFormats: ['wav'],
      params: { resource_type: 'raw' }, //=> this is in case you want to upload other type of files, not just images
      filename: function (req, res, cb) {
        cb(null, res.originalname); // The file on cloudinary would have the same name as the original file name
      }
    });
    
    const uploader = multer({ storage });


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



// Record a dream page
router.get('/record', (req, res) => {
        res.render('users/record.hbs', {loggedInUser: req.session.loggedInUser})
});

router.post('/record', (req, res) => {
    const {title, categories, description, date} = req.body
    const owner = req.session.loggedInUser._id
    DreamModel.create({title, categories, description, date, owner})
      .then(() => {
        req.session.title = title   
      })
      .catch((err) => {
        console.log(err)
        res.render("users/record.hbs", {failed : true})
     })
});

// Post for the recording
router.post('/upload', uploader.single('audio_data'), (req, res, next) => {
    console.log('file is: ', req.file)
      if (!req.file) {
        next(new Error('No file uploaded!'));
        return;
      }
      let audioUrl = req.file.path
      DreamModel.findOneAndUpdate({title: req.session.title}, {$set: {audioUrl}})
        .then(() => res.redirect('/dreams'))
        .catch((err) => {
            console.log(err)
            res.render("users/record.hbs", {failed : true})
         })
  })



// Private dreams details
router.get('/dreams', (req, res) => {
    DreamModel.find({owner: req.session.loggedInUser._id})
        .then((result) => {
            res.render('users/dreams.hbs', {result})
        });
});



// Edit dreams
router.get('/dreams/:id/edit', (req, res, next) => {
    DreamModel.findById(req.params.id)
       .then((result) => {
           res.render("users/edit.hbs", {result})
    })
});
  
  
router.post('/dreams/:id/edit', (req, res, next) => {
    let {title, categories, description, date, status} = req.body
    let dreamId = req.params.id
    DreamModel.findByIdAndUpdate(dreamId, {$set: {title, categories, description, date, status}})
        .then(() => {
             res.redirect('/dreams')
        })
        .catch((err) => {
            console.log(err)
            res.render("users/record.hbs", {failed : true})
         })
});



module.exports = router;