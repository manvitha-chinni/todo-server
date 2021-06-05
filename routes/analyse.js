const express = require("express");
const auth = require('../middlewares/auth');
const { TaskTrack } = require("../models/taskTrack");
const { RoutineTrack} = require("../models/routineTrack");
const router = express.Router();

const today = new Date();
const todayDay  = today.getDay() || 7;
const todayDate = today.getDate();
const sunday = new Date();
sunday.setDate(sunday.getDate()-todayDay);
const startDate = new Date();
startDate.setDate(startDate.getDate()-todayDate);


async function getTracks(userId,firstDate,isTasks) {
    let tracks;
    if(isTasks) tracks = await TaskTrack.find({userId,date:{$gt:firstDate,$lte:today}}).sort({date:1});
    else tracks = await RoutineTrack.find({userId,date:{$gt:firstDate,$lte:today}}).sort({date:1});
    tracks= tracks.map((track)=>{
        const {completedCount,totalCount,userId,date,_id:id}=track;
        const tempTrack={completedCount,totalCount,userId,date,id};
        return tempTrack; 
      })
      return tracks;
    
}

router.get('/tasks',auth,async(req,res)=>{
    const {type} = req.query; //week -> 1, month-> 2
    const userId = req.user.id;
    let tasksTrack;
    try{
        if(type==1)
            tasksTrack= await getTracks(userId,sunday,true)
        else if(type==2)
            tasksTrack= await getTracks(userId,startDate,true);
        else
            res.status(400).send("invalid type")
    }
    catch(e){
        res.status(500).send("internal server error");
    }
    
    res.status(200).send(tasksTrack);
})



router.get('/routines',auth,async(req,res)=>{
    const {type} = req.query; //week -> 1, month-> 2
    const userId = req.user.id;
    let routinesTrack;
    try{
        if(type==1)
            routinesTrack = await getTracks(userId,sunday,false);
        else if(type==2)
            routinesTrack =  await getTracks(userId,startDate,false);
        else
            res.status(400).send("invalid type")
    }
    catch(e){
        res.status(500).send("internal server error");
    }
    res.status(200).send(routinesTrack);
})

module.exports = router;