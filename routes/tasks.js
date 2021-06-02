const express = require("express");
const mongoose = require('mongoose')
const {Task,validate} = require("../models/tasks");
const auth = require('../middlewares/auth');
const router = express.Router();



// @desc get Tasks
// @route GET /Tasks
router.get('/',auth, async (req, res) => {
    const userId = req.user.id;
    const {date} = req.query;
    console.log(date);
    let tasks;
    try{
        tasks = await Task.find({userId,date});
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

// @desc get Task by id
// @route GET /Tasks

router.get('/:id', auth ,async (req, res) => {
    let task;
    try
    {
      const id = req.params.id;
      if(!mongoose.isValidObjectId(id))
      return res.status(404).send("Invalid Task id");
      task = await Task.findById(id);
    }
    catch(e)
    {
        console.log(e);
    }
    if (!task) return res.status(404).send('The Task with the given ID was not found.');
    res.send(task);
});


// @desc create Task
// @route post /Tasks

  router.post('/', auth ,async (req, res) => {
    req.body.userId=req.user.id;
    req.body.completed=false;
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
    try
    {
        const task = new Task(req.body);
          await task.save();
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
        task =await Task.findByIdAndUpdate(id,
            {...req.body},{new:true});
        // changeing _id to id in task
        let newtask=JSON.parse(JSON.stringify(task));
        newtask.id=task._id;
        delete newtask._id;
        delete newtask.__v;
        task=newtask;
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
            let task = await Task.findByIdAndRemove(id);
            // changeing _id to id in task
            let newtask=JSON.parse(JSON.stringify(task));
            newtask.id=task._id;
            delete newtask._id;
            delete newtask.__v;
            task=newtask;
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