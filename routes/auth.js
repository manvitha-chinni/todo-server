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
  let UserData;
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
    user = await User.find({ email: userData.email });
    if (user.length == 0) {
      user = await new User({
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
      }).save();
    }
  } catch (err) {
    console.log(err.message)
    return res.status(500).send("Internal Server Error");
  }

  // sending jwt token
  const token = jwt.sign(
    { name: user[0].name, email: user[0].email, picture: user[0].picture },
    process.env.JSON_PRIVATE_KEY
  );
  // console.log(user);
  res.status(200).send(token);
});

module.exports = router;
