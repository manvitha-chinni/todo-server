//imports
const express = require("express");
const { User } = require("../models/users");
const auth = require('../middlewares/auth');
//initialization
const router = express.Router();

//routes
//@desc add push notifications subscription

//@route post/subscribe
router.post("/",auth, async (req, res) => {
    console.log('im here in sub')
  let user = req.user;
  try {
    await User.findByIdAndUpdate(user.id,{"$push":{subscriptions:req.body.subscription}})
    res.status(200).send("added subscription"); 
  } catch (err) {
    console.log(err.message)
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
