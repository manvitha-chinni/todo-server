const express = require("express");
const authRoute = require("./routes/auth");
const taskRoute = require("./routes/tasks");
const routineRoute = require("./routes/routines");
const analyseRoute = require("./routes/analyse");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

// intialization

const app = express();
dotenv.config({ path: "./config/config.env" });

app.use(cors());

// connecting to db
connectDB();

// middlewares

app.use(express.json());

// routes
app.use("/auth", authRoute);
app.use("/tasks",taskRoute);
app.use("/routines",routineRoute);
app.use("/analyse",analyseRoute);
app.get("/",async(req,res)=>{
  res.send("welcome to todo api");
});
// start app

// getting port number
const port = process.env.PORT;
app.listen(port, () => {
  console.log("listening on port: " + port);
});
