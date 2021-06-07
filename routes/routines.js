const express = require("express");
const mongoose = require('mongoose')
const {Routine,validate} = require("../models/routines");
const {RoutineTrack} = require("../models/routineTrack");
const auth = require('../middlewares/auth');
const router = express.Router();
const today = new Date();
const todayDate = today.getDate();
const todayDay = today.getDay();

const todayRoutinesFilter = {
       $or:[{"repeat.type":1},
       {$and:[{"repeat.type":2}, {"repeat.value":todayDay}]},
       {$and:[{"repeat.type":3}, {"repeat.value":todayDate}]},]
  }

async function updateTrackTotalCount(userId,date){
  const todayRoutines=await Routine.find( {...todayRoutinesFilter,userId});
  await RoutineTrack.updateOne({userId,date:new Date(date)},{totalCount:todayRoutines.length});
}
function updateTaskKeys(task){
  let newtask=JSON.parse(JSON.stringify(task));
    newtask.id=task._id;
    delete newtask._id;
    delete newtask.__v;
    return newtask;
}

// @desc get today routines
// @route GET /routines/today
router.get('/today',auth, async (req, res) => {
    const userId = req.user.id;
    let todayRoutines;
    let todayRoutineTrack;
    const {date} = req.query;
    try{
        todayRoutineTrack = await RoutineTrack.find({userId,date:new Date(date)});
        if(!todayRoutineTrack.length){
            todayRoutines = await Routine.updateMany(
                    {...todayRoutinesFilter,userId},
                    {completed:false},
                    {new:true});
            console.log(todayRoutines.n);
            const todayRoutineTrack = new RoutineTrack({userId,date:new Date(date),completedCount:0,totalCount:todayRoutines.n});
            await todayRoutineTrack.save();
        } 
        todayRoutines=await Routine.find({...todayRoutinesFilter,userId}).sort({time:1});
        todayRoutines = todayRoutines.map((routine)=>{
          const {title,description,notify,repeat,time,_id:id,completed}=routine;
          return {title,description,notify,repeat,time,id,completed};
        })
        res.status(200).send(todayRoutines);
    }catch(e){
        console.log(e);
        res.status(500).send("Internal server Error")
    }
  });

// @desc get all routines
// @route GET /routines/all
router.get('/all',auth, async (req, res) => {
  const userId = req.user.id;
  let routines;
  try{
      routines= await Routine.find({userId}).sort({time:1});
      routines= routines.map((routine)=>{
        const {title,description,notify,repeat,time,_id:id}=routine;
        return {title,description,notify,repeat,time,id};
      })
      res.status(200).send(routines);
  }catch(e){
      console.log(e);
      res.status(500).send("Internal server Error")
  }
});

// @desc create Routine
// @route post /Routines

  router.post('/', auth ,async (req, res) => {
    req.body.userId=req.user.id;
    req.body.completed = false;
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
    try
    {
        let routine = new Routine(req.body);
        await routine.save();
        // changeing _id to id in task
        routine=updateTaskKeys(routine);

        res.status(200).send(routine);
    }catch(e){
        console.log(e);
        res.status(500).send('Internal Server Error');
    }
  
  });
  

// @desc update Routine
// @route put /Routines/id

  router.put('/:id',auth, async (req, res) => {
    let routine;
    const {updateType,date} = req.query;
    const userId=req.user.id;
    req.body.userId=userId;
    try{
      const id = req.params.id;
      if(!mongoose.isValidObjectId(id))
        return res.status(404).send("Invalid Routine id");
      routine = await Routine.findById(id);
      if(!routine) return res.status(400).send('Invalid Routine id');
      if(routine.userId === req.user.id){
        if(updateType==1){
          const todayRoutineTrack = await RoutineTrack.find({userId,date:new Date(date)});
          const newCount = todayRoutineTrack[0].completedCount+(req.body.completed ? 1 : -1);
          await RoutineTrack.updateOne({userId,date:new Date(date)},{completedCount:newCount});
        }
        routine = await Routine.findByIdAndUpdate(id,{...req.body},{new:true});
        updateTrackTotalCount(userId,date);

        // changeing _id to id in task
        routine=updateTaskKeys(routine);

        return res.status(200).send(routine); 
      } 
      else{
          return res.status(400).send("U dont have access");
      }
    }
    catch(e)
    {
        console.log(e);
        res.status(500).send('Internal Server Error');
    }
  });
  
// @desc delete Routine
// @route delete /Routines/id

  router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const {date} = req.query;
    const userId = req.user.id;
    if(!mongoose.isValidObjectId(id))
    return res.status(404).send("Invalid Routine id");
    try{
        let routine = await Routine.findById(id);
        if (!routine) return res.status(404).send('The Routine with the given ID was not found.');
        if(routine.userId === userId)
        { 
            let routine = await Routine.findByIdAndRemove(id);
            console.log("routine",routine);
            if(routine.completed){
              const todayRoutineTrack = await RoutineTrack.find({userId,date:new Date(date)});
              const newCount = todayRoutineTrack[0].completedCount-1;
              await RoutineTrack.updateOne({userId,date:new Date(date)},{completedCount:newCount});
            }
            updateTrackTotalCount(userId,date);
            // changeing _id to id in task
            routine=updateTaskKeys(routine);
            return res.status(200).send(routine)
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