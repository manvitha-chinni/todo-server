const express = require("express");
const mongoose = require('mongoose')
const {Task,validate} = require("../models/tasks");
const auth = require('../middlewares/auth');
const { TaskTrack } = require("../models/taskTrack");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const { date } = require("joi");
const router = express.Router();



const mailoptions={
  from:'TodoTimeManagement@gmail.com',
  to:'manvitha.k@svce.edu.in',
  subject:'Email from Todo-App',
  text:"test this application"
}
const transpoter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:'TodoTimeManagement@gmail.com',
    pass:'Todo@timemgmt'
  }
})

function sendEmailNodification(task){
  const taskDate = new Date(task.date);
  const date = taskDate.getDate();
  const month = (taskDate.getMonth())+1;
  const hours = task.time[0]+task.time[1];
  const min = task.time[3]+task.time[4];
  const emailTime = min+" "+hours+" "+date+" "+month+" *";
  mailoptions.subject="Todo-App: "+task.title;
  mailoptions.text = task.description;
  cron.schedule(emailTime,()=>{
    transpoter.sendMail(mailoptions,(error,info)=>{
      if(error){
        console.log(error);
      }
      else{
        console.log('email send: '+info.response);
      }
    });
  });
}

async function updateTrackTotalCount(userId,date){
  const tasks = await Task.find({userId,date});
  await TaskTrack.updateOne({userId,date:new Date(date)},{totalCount:tasks.length});
}

async function updateTrackCompletedCount(userId,date) {
  const tasks = await Task.find({userId,date,completed:true});
  await TaskTrack.updateOne({userId,date:new Date(date)},{completedCount:tasks.length})
}
function updateTaskKeys(task){
  let newtask=JSON.parse(JSON.stringify(task));
    newtask.id=task._id;
    delete newtask._id;
    delete newtask.__v;
    return newtask;
}

// @desc get Tasks
// @route GET /Tasks
router.get('/',auth, async (req, res) => {
    const userId = req.user.id;
    const {date} = req.query;
    const filter={userId};
    if(date !== 'all'){
      filter.date=date;
    }
    let tasks;
    try{
        tasks = await Task.find(filter).sort('date');
        tasks= tasks.map((task)=>{
          const {title,description,notify,completed,date,time,_id:id}=task;
          tempTask={title,description,notify,completed,date,time,id};
          return tempTask; 
        })
    }catch(e){
        console.log(e);
    }
    res.send(tasks);
  });

// @desc create Task
// @route post /Tasks

  router.post('/', auth ,async (req, res) => {
    req.body.userId=req.user.id;
    req.body.completed=false;
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let {userId,date} = req.body;
    let taskTrack;    
    try
    {
      const task = new Task(req.body);
      await task.save();
      taskTrack = await TaskTrack.find({userId,date:new Date(date)});
      if(!taskTrack.length){
        await (new TaskTrack({userId,date:new Date(date),completedCount:0,totalCount:1})).save();
      }
      updateTrackTotalCount(userId,date);
      if(task.notify)   sendEmailNodification(task);

      res.send(task);
    }catch(e){
        console.log(e);
        res.status(500).send('Internal Server Error')
    }
  });
  

  
// @desc update Task
// @route put /Tasks/id

  router.put('/:id',auth, async (req, res) => {
    let task;
    req.body.userId=req.user.id;
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
    try
    {
      const id = req.params.id;
      if(!mongoose.isValidObjectId(id))
      return res.status(404).send("Invalid Task id");

      task = await Task.findById(id);
      if(!task) return res.status(400).send('Invalid Task id');
      if(task.userId === req.user.id)
      {
        let oldDate = task.date;
        task =await Task.findByIdAndUpdate(id,{...req.body},{new:true});
        const {userId,date} = task;
        if(date!=oldDate){
          updateTrackTotalCount(userId,oldDate);
          updateTrackCompletedCount(userId,oldDate);
          let taskTrack = await TaskTrack.find({userId,date:new Date(date)});
          if(!taskTrack.length){
            await (new TaskTrack({userId,date:new Date(date),completedCount:0,totalCount:1})).save();
          }
        }
        updateTrackTotalCount(userId,date);
        updateTrackCompletedCount(userId,date)
      
        // changeing _id to id in task
       task =  updateTaskKeys(task);
      if(task.notify)   sendEmailNodification(task);

      }
      else
      {
          return res.status(400).send("U dont have access");
      }
      
    }
    catch(e)
    {
        console.log(e);
    }
   
    if (!task) return res.status(404).send('The Task with the given ID was not found.')
    res.send(task);
  });
  

    
// @desc delete Task
// @route delete /Tasks/id

  router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    if(!mongoose.isValidObjectId(id))
    return res.status(404).send("Invalid Task id");
    try{

        let task = await Task.findById(id);
        if (!task) return res.status(404).send('The Task with the given ID was not found.');
        if(task.userId === req.user.id)
        {
            let {userId,date}=task;
            task = await Task.findByIdAndRemove(id);
            updateTrackCompletedCount(userId,date)
            updateTrackTotalCount(userId,date)

            // changeing _id to id in task
            task = updateTaskKeys(task)
            return res.status(200).send(task)
        }
        else
        {
            return res.status(400).send("U don't have access");
        }       
    }
    catch(e)
    {
        console.log(e);
        res.status(500).send("something went wrong");
    }
  });
  

module.exports = router;