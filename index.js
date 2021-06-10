const express = require("express");
const webPush = require('web-push');
const authRoute = require("./routes/auth");
const taskRoute = require("./routes/tasks");
const routineRoute = require("./routes/routines");
const analyseRoute = require("./routes/analyse");
const subscriptionRoute = require("./routes/subscribe");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

// intialization
const publicVapidKey =process.env.VAPID_PUBLIC_KEY;
const privateVapidKey =process.env.VAPID_PRIVATE_KEY;
webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);
const app = express();
dotenv.config({ path: "./config/config.env" });

app.use(cors());

// connecting to db
async function connectToDb(){
  await connectDB();
}
connectToDb();

// middlewares

app.use(express.json());

// routes
app.use("/auth", authRoute);
app.use("/tasks",taskRoute);
app.use("/routines",routineRoute);
app.use("/analyse",analyseRoute);
app.use("/subscribe",subscriptionRoute);
app.get("/",async(req,res)=>{
  res.send("welcome to todo api");
});
// app.post('/subscribe', (req, res) => {
//   const subscription = req.body

//   res.status(201).json({});

//   const payload = JSON.stringify({
//     title: 'Push notifications with Service Workers',
//   });

//   webPush.sendNotification(subscription, payload)
//     .catch(error => console.error(error));
// });

// start app

// getting port number
const port = process.env.PORT;
app.listen(port, () => {
  console.log("listening on port: " + port);
});
