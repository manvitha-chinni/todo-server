//imports
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const { User } = require("../models/users");
const jwt = require("jsonwebtoken");

//initialization
const router = express.Router();

//routes
//@desc login user

//@route post/auth
router.post("/", async (req, res) => {

  // verifing google tokenID 
  const { tokenId } = req.body;
  // console.log("token is ", tokenId);
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const client = new OAuth2Client(googleClientId);
  let userData;
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: googleClientId,
    });
    userData = ticket.getPayload();
  } catch (err) {
    console.log(err.message)
    return res.status(400).send("Inavlid token");
  }


  // checking for the user
  let user;

  try {
    const users = await User.find({ email: userData.email });
    
    if (users.length == 0) {
      user = await new User({
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
      }).save();
    }
    else{
      user = users[0];
    }
  } catch (err) {
    console.log(err.message)
    return res.status(500).send("Internal Server Error");
  }

  // sending jwt token
  const token = jwt.sign(
    { name: user.name, email: user.email, picture: user.picture },
    process.env.JSON_PRIVATE_KEY
  );
  // console.log(user);
  res.status(200).send(token);
});

module.exports = router;
