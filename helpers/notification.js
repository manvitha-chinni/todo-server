const {User} = require('../models/users');
const {Task} = require('../models/tasks');
const {Routine} = require('../models/routines');
const webPush = require('web-push');


function getNextMinuteTime(){
    let time = new Date;
    // time.setMinutes(time.getMinutes()+1);
    let hours = time.getHours();
    let minutes = time.getMinutes();
    hours = (hours < 10) ? '0'+hours :hours;
    minutes = (minutes <10) ? '0'+minutes : minutes;
    return `${hours}:${minutes}`;
}
async function notifyUsers(){

    let todayDate = new Date();
    taskDate=todayDate.toISOString().slice(0,10);
    const nextMinuteTime = getNextMinuteTime();
    const tasks = await Task.find({date:taskDate,time:nextMinuteTime,notify:true});
    tasks.forEach(async (task)=>{
        const payload = JSON.stringify({
            title: task.title,
            body:task.description
          });
          const {subscriptions} = await User.findById(task.userId);
          subscriptions.forEach(sub=>{
            const subscription = JSON.parse(sub);
            webPush.sendNotification(subscription, payload)
            .catch(error => console.error(error));
          })
    })    

    const todayRoutinesFilter = {
        $or:[{"repeat.type":1},
        {$and:[{"repeat.type":2}, {"repeat.value":todayDate.getDay()}]},
        {$and:[{"repeat.type":3}, {"repeat.value":todayDate.getDate()}]},],
        time:nextMinuteTime,
        notify:true
   }
   let routines = await Routine.find(todayRoutinesFilter);
   routines.forEach(async (routine)=>{
    const payload = JSON.stringify({
        title: routine.title,
        body:routine.description
      });
      const {subscriptions} = await User.findById(routine.userId);
      subscriptions.forEach(sub=>{
        const subscription = JSON.parse(sub);
        webPush.sendNotification(subscription, payload)
        .catch(error => console.error(error));
      })
})   
}
module.exports = notifyUsers;
