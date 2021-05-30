const mongoose = require("mongoose");
const Joi = require("joi");

// mongoose schema for user
const RoutineSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true,
  },
  description: {
    type: String,
    required: true,
  },
  time: {
    type: String,
  },
  date: {
    type: Map,
    required:true
  },
  notify:{
    type:Boolean,
    required:true
  },
  userId:{
    type:String,
    required:true
  },
  completed:{
    type:Boolean,
    default:false
  }
});
  
function validateRoutine(routine) {
    const schema = Joi.object({
      title: Joi.string()
        .min(2)
        .max(50)
        .required(),
      description: Joi.string()
        .min(10)
        .required(),
      userId: Joi.string()
        .min(2)
        .max(50)
        .required(),
      time: Joi.string(),
      date:Joi.any()
        .required(),
      notify:Joi.boolean()
        .required(),
      completed:Joi.boolean()
        .required()
    });
  
    return schema.validate(routine);
  }

// creating Routine model
const Routines = mongoose.model("Routines", RoutineSchema);

exports.Routine = Routines;
  
exports.validate = validateRoutine;