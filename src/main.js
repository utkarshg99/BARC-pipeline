var ipc = require('electron').ipcRenderer;
let statusPlay = "toStart";
let secpassed = 0;
var vidTag = document.getElementById("netplay");
let vidarr = ipc.sendSync('syncGetVidArr', 'get')
let videoJSON = ipc.sendSync('syncGetVid', 'get')
let userJSON = ipc.sendSync('syncGetUserStat', 'get')

function setStat() {
  if(userJSON.status=="newUser"){
    return;
  }
  else if (statusPlay == "toStart") {
    userJSON.status="recording";
    ipc.sendSync("syncSetUserData", userJSON);
    document.getElementById("app").style.display="none";
    document.getElementById("video_set").style.display="";
    statusPlay = "started";
    secpassed=0;
    ipc.sendSync('syncStartRec', 'start')
    playVideo();
  }
  else if(statusPlay == "started") {
    if(secpassed>=videoJSON.secs){
      statusPlay = "waiting";
      secpassed = 0;
      vidTag.pause();
      ipc.sendSync('syncWaitRec', 'wait')
      userJSON.status="waiting"
      userJSON = ipc.sendSync("syncSetUserData", userJSON);
    }
  }
  else if(statusPlay == "waiting") {
    if(secpassed>=30){
      statusPlay = "toStart";
      ipc.sendSync('syncStopRec', 'stop')
      stopVideo();
    }
  }
  else{
      document.getElementById("ends").innerHTML=" Data Collection is Over!!! ";
      document.getElementById("netplay").style.display="none";
      clearInterval(timerC);
      clearInterval(statInterval);
      statusPlay="STOP"
      userJSON.status="Recorded"
      userJSON = ipc.sendSync("syncSetUserData", userJSON);
      vidTag.pause();
  }
}

function playVideo(){
    videoJSON = ipc.sendSync('syncGetVid', 'get')
    userJSON = ipc.sendSync("syncChangeFileName", userJSON);
    var sourceElement = document.createElement("source");
    sourceElement.setAttribute('id', "vplay");
    sourceElement.setAttribute('src', videoJSON.path);
    vidTag.appendChild(sourceElement);
    vidTag.play();
}
function stopVideo(){
    vidTag.pause();
    var element = document.getElementById("vplay");
    vidTag.removeChild(element);
    if(videoJSON.number==vidarr.length-1)
        statusPlay="END"
    else
        location.reload();
}

let statInterval = setInterval(setStat, 500);
let timerC = setInterval(()=>{secpassed++}, 1000);