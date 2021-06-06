const mongoose = require("mongoose");
const Joi = require("joi");

// mongoose schema for user
const RoutineTrackSchema = new mongoose.Schema({
  
  date: {
    type: Date,
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
  

// creating RoutineTrack model
const RoutineTracks = mongoose.model("RoutineTrack", RoutineTrackSchema);

exports.RoutineTrack = RoutineTracks;
