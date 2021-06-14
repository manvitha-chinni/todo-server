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
  let user = req.user;
  try {
    const modifiedUser = await User.findByIdAndUpdate(user.id,{"$push":{subscriptions:req.body.subscription}},{new:true});
    const resp ={value:modifiedUser.subscriptions.length};
    return res.status(200).send(resp); 
  } catch (err) {
    console.log(err.message)
    return res.status(500).send("Internal Server Error");
  }
});


// @dec delete subscription address when user logsout
// @route delete/subscription
router.post("/delete",auth,async(req,res)=>{
  let user = req.user;
  try{
    const exUser = await User.findById(user.id);
    const newSubscriptions = exUser.subscriptions
    exUser.subscriptions.splice(req.body.value-1,1);
    await User.findByIdAndUpdate(user.id,{subscriptions:newSubscriptions});
    res.status(200).send("deleted subscription"); 
  }
  catch(err){
    console.log(err.message)
    return res.status(500).send("Internal server error");
  }
})
module.exports = router;
