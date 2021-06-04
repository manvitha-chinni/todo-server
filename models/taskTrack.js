const mongoose = require("mongoose");
const Joi = require("joi");

// mongoose schema for user
const TaskTrackSchema = new mongoose.Schema({
  
  date: {
    type: String,
    required:true
  },
  completedCount:{
    type:Number,
    default:0
  },
  totalCount:{
    type:Number,
    default:0
  },
  userId:{
    type:String,
    required:true
  }
});
  

// creating TaskTrack model
const TaskTracks = mongoose.model("TaskTrack", TaskTrackSchema);

exports.TaskTrack = TaskTracks;
