const express = require("express");
const router = express.Router();
const UserModel = require("../models/User.model.js");
const DreamModel = require("../models/Dream.model.js");
const hbs          = require('hbs');
//Configuration for Cloudinary and Recording
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
//require ('dotenv').config()
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary,
  folder: "Records", // The name of the folder in cloudinary
  allowedFormats: ["wav"],
  params: { resource_type: "raw" },
  filename: function (req, res, cb) {
    cb(null, res.originalname); // The file on cloudinary would have the same name as the original file name
  },
});
const uploader = multer({ storage });
// -----------------------------------------

// Create a dream page
router.get("/record", (req, res) => {
  //Set up of the date for the default value of the form
  let todayDate = new Date();
  let dd = String(todayDate.getDate()).padStart(2, "0");
  let mm = String(todayDate.getMonth() + 1).padStart(2, "0");
  let yyyy = todayDate.getFullYear();
  todayDate = yyyy + "-" + mm + "-" + dd;
  
  res.render("users/record.hbs", {loggedInUser: req.session.loggedInUser,todayDate} );
});


// Post route for the text part of the form
router.post("/record", (req, res) => {
  console.log("In the post record route");
  console.log(req.body);
  const { title, categories, description, date, status, languages } = req.body;
  const owner = req.session.loggedInUser._id;
  DreamModel.findOneAndUpdate({ title, categories, description, date, status, owner, languages }, {$set: {title, categories, description, date, status, owner, languages}}, {upsert: true}) //upsert will create the document if it's not there
    .then(() => {
      console.log("Dream created");
      req.session.title = title;
      res.send("All good");
    })
    .catch((err) => {
      console.log(err);
      res.render("users/record.hbs", { failed: true });
    });
});


// Post for the recording part (store it in cloudinary and in the db)
router.post("/upload", uploader.single("audio_data"), (req, res, next) => {
  console.log("file is: ", req.file);
  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }
  let audioUrl = req.file.path;
  DreamModel.findOneAndUpdate(
    { title: req.session.title },
    { $set: { audioUrl } }
  )
    .then(() => {
      console.log("before redirect");
      res.redirect("/dreams");
    })
    .catch((err) => {
      console.log(err);
      res.render("users/record.hbs", { failed: true });
    });
});

//Post for a dream without recording part
router.post("/recordNoVoice", (req, res) => {
  console.log("In the post record No Voice route");
  console.log(req.body);
  const { title, categories, description, date, status, languages } = req.body;
  const owner = req.session.loggedInUser._id;
  DreamModel.findOneAndUpdate({ title, categories, description, date, status, owner, languages }, {$set: {title, categories, description, date, status, owner, languages}}, {upsert: true}) //upsert will create the document if it's not there
    .then(() => {
      console.log("Dream created");
      res.redirect("/dreams")
    })
    .catch((err) => {
      console.log(err);
      res.render("users/record.hbs", { failed: true });
    });
});

//Helpers for the like system
hbs.registerHelper("isPublic", (dream) => {
  return dream.status == "public"
})

// Private list of dreams
router.get("/dreams", (req, res) => {
  DreamModel.find({ owner: req.session.loggedInUser._id })
    .then((result) => {
      res.render("users/dreams.hbs", { result });
    })
    .catch((err) => console.log(err));
});

router.get("/dreams/search", (req, res) => {
  let {date, categories, status, languages} = req.query
  console.log(req.query)
  let search = {};
  search.owner = req.session.loggedInUser._id
  if(date !== ""){
    search.date = new Date(date);
  }
  if(categories !== ""){
    search.categories = categories;
  }
  if(status !== undefined){
    search.status = status;
  }
  if(languages !== undefined && languages !== ""){
    search.languages = languages;
  }
  console.log(search)
  DreamModel.find(search)
  .then((result) => {
    // We delete the owner from the search object to pass it to the view
    delete search.owner
    // We change the format of the date
    if(search.date) search.date = search.date.toLocaleDateString()
    // if the result is empty, to show a message "No Result Found"
    let noResult = false
    if(result.length === 0) noResult = true;
    res.render("users/dreams.hbs", { result, search, madeSearch:true , noResult });
  })
  .catch((err) => console.log(err));
});


// Edit dreams
router.get("/dreams/:id/edit", (req, res, next) => {
  DreamModel.findById(req.params.id).then((result) => {
    let resultDate = new Date(result.date);
    let dd = String(resultDate.getDate()).padStart(2, "0");
    let mm = String(resultDate.getMonth() + 1).padStart(2, "0");
    let yyyy = resultDate.getFullYear();
    let catString = ""
      if (result.categories !== null) {
        let catArr = result.categories;
        catString = catArr.join(", ")
      }
      
    resultDate = yyyy + "-" + mm + "-" + dd;
    let publicStatus;
    result.status == "public" ? (publicStatus = true) : (publicStatus = false);
    res.render("users/edit.hbs", { result, publicStatus, resultDate, catString});
  });
});


router.post("/dreams/:id/edit", (req, res, next) => {
  console.log(req.body);
  let { title, categories, description, date, status, languages } = req.body;
  let update = {title, description, date};
  if(categories !== undefined){
    update.categories = categories;
  }
  if(status !== undefined){
    update.status = status;
  }
  if(languages !== undefined && languages !== ""){
    update.languages = languages;
  }
  let dreamId = req.params.id;
  DreamModel.findByIdAndUpdate(dreamId, {$set: update})
    .then(() => {
      res.redirect("/dreams");
    })
    .catch((err) => {
      console.log(err);
      res.render("users/record.hbs", { failed: true });
    });
});


// Delete Dream
router.post("/dreams/:id/delete", (req, res) => {
  DreamModel.findByIdAndDelete(req.params.id)
    .then(() => res.redirect("/dreams"))
    .catch((err) => {
      console.log(err);
    });
});


// Dream details
router.get("/dreams/:id/details", (req, res, next) => {
  DreamModel.findById(req.params.id)
    .then((result) => {
      let catString = ""
      if (result.categories !== null) {
        let catArr = result.categories;
        catString = catArr.join(", ")
      }
      let editable;
      result.owner == req.session.loggedInUser._id ? (editable = true) : (editable = false);
      res.render("users/dream-details.hbs", { result, editable, catString });
    })
    .catch((err) => console.log(err));
});


// Public list of dreams
router.get("/dreamFlow", (req, res) => {
  UserModel.findById(req.session.loggedInUser._id)
    .then((result) => {
      let dreamsLiked = result.likedDreams
      hbs.registerHelper("isIncluded", (dream) => {
        return dreamsLiked.includes(dream._id)
      })
      DreamModel.find({ status: "public" })
        .then((result) => {
          res.render("users/dream-flow.hbs", { result });
      })
    })
});

router.post("/dreamFlow/:id/:likes", (req, res) => {
  UserModel.findById(req.session.loggedInUser._id)
    .then((result) => {
      let newLikes;
      let newLikedList = result.likedDreams
      if (newLikedList.includes(req.params.id)){
        newLikes = Number(req.params.likes) - 1
        let index = newLikedList.indexOf(req.params.id)
        newLikedList.splice(index,1)
      } else {
        newLikes = Number(req.params.likes) + 1
        newLikedList.push(req.params.id)
      }
      DreamModel.findByIdAndUpdate(req.params.id, {$set: {likes: newLikes}})
        .then(() => {
        UserModel.findByIdAndUpdate(req.session.loggedInUser._id, {$set: {likedDreams: newLikedList}})
          .then(() => res.redirect("/dreamFlow"))
          .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
    })
  
})

router.get("/dreamFlow/search", (req, res) => {
  let {date, categories, languages} = req.query
  console.log(req.query)
  let search = {};
  search.status = "public"
  if(date !== ""){
    search.date = new Date(date);
  }
  if(categories !== ""){
    search.categories = categories;
  }
  if(languages !== undefined && languages !== ""){
    search.languages = languages;
  }
  console.log(search)
  DreamModel.find(search)
  .then((result) => {
    // We delete the status from the search object to pass it to the view
    delete search.status
    // We change the format of the date
    if(search.date) search.date = search.date.toLocaleDateString()
    // if the result is empty, to show a message "No Result Found"
    let noResult = false
    if(result.length === 0) noResult = true;
    res.render("users/dream-flow.hbs", { result, search, madeSearch:true , noResult });
  })
  .catch((err) => console.log(err));
});



module.exports = router;
