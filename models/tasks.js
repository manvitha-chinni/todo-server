const mongoose = require("mongoose");
const Joi = require("joi");

// mongoose schema for user
const TaskSchema = new mongoose.Schema({
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
    required: true,
  },
  date: {
    type: Date,
    required:true
  },
  completed:{
    type:Boolean,
    default:false,
  },
  notify:{
    type:Boolean,
    required:true
  },
  userId:{
    type:String,
    required:true
  }
});
  
function validateTask(Task) {
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
      time: Joi.string()
        .required(),
       date:Joi.date()
       .required(),
       completed:Joi.boolean()
       .required(),
       notify:Joi.boolean()
       .required()
    });
  
    return schema.validate(Task);
  }

// creating Task model
const Tasks = mongoose.model("Tasks", TaskSchema);

exports.Task = Tasks;
  
exports.validate = validateTask;