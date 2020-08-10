URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia()
var rec;
//Recorder.js object
var input;
//MediaStreamAudioSourceNode we'll be recording
// shim for AudioContext when it's not avb.
var AudioContext;
var audioContext;
let upload;
//new audio context to help us record
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
//add events to those 3 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
  console.log("recordButton clicked");
  var constraints = {
    audio: true,
    video: false,
  };
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext();

  /* Disable the record button until we get a success or fail from getUserMedia() */
  recordButton.disabled = true;
  stopButton.disabled = false;

  // We're using the standard promise based getUserMedia()
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      console.log(
        "getUserMedia() success, stream created, initializing Recorder.js ..."
      );
      /* assign to gumStream for later use */
      gumStream = stream;
      /* use the stream */
      input = audioContext.createMediaStreamSource(stream);
      /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
      rec = new Recorder(input, {
        numChannels: 1,
      });
      //start the recording process
      rec.record();
      console.log("Recording started");
    })
    .catch(function (err) {
      //enable the record button if getUserMedia() fails
      recordButton.disabled = false;
      stopButton.disabled = true;
    });
}

function stopRecording() {
  console.log("stopButton clicked");
  //disable the stop button, enable the record too allow for new recordings
  stopButton.disabled = true;
  recordButton.disabled = false;
  //tell the recorder to stop the recording
  rec.stop(); //stop microphone access
  gumStream.getAudioTracks()[0].stop();
  rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
  var url = URL.createObjectURL(blob);
  var au = document.createElement("audio");
  var li = document.createElement("li");

  //name of .wav file to use during upload and download (without extendion)
  var filename = new Date().toISOString();

  //add controls to the <audio> element
  au.controls = true;
  au.src = url;

  //add the new audio element to li
  li.appendChild(au);

  //add the filename to the li
  li.appendChild(document.createTextNode(filename));

  //add the li element to the ul
  recordingsList.appendChild(li);
}


 
let btnsArr = document.querySelectorAll(".dropdown-item") 
btnsArr.forEach (btn => {
  btn.addEventListener("click", function(event) {
    btn.classList.toggle("active");
    // categories.forEach((elem, index) => {
    //   if (elem == btn.value){
    //     categories.splice(index, 1)
    //   } else {
    //     categories.push(btn.value)
    //   }
    // })
})  
}) 


function sendData(blob) {
  var filename = new Date().toISOString();
  // XMLHTTP Request
  var xhr = new XMLHttpRequest();
  xhr.onload = function (e) {
    if (this.readyState === 4) {
      window.location.href = "/dreams";
    }
  };
  var fd = new FormData();
  fd.append("audio_data", blob, filename);
  xhr.open("POST", "/upload", true);
  let activeBtns = document.querySelectorAll(".active")
  let categories = [];
  activeBtns.forEach(btn => categories.push(btn.value))
  let myBody = {
    title: document.querySelector("#nameYourDream").value,
    description: document.querySelector("#description").value,
    date: document.querySelector("#date").value,
    categories: categories,
    status: "private"
  };

  console.log(myBody);

  fetch("/record", {
    method: "POST",
    body: JSON.stringify(myBody),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then(() => {
      console.log("fetch done");
      xhr.send(fd);
    })
    .catch((err) => console.log(err));
}

//upload linked to the submit button of the form
upload = document.getElementById("submitBtn");
upload.addEventListener("click", (event) => {
  if (typeof rec == "undefined") {
    // There is no recording
    let activeBtns = document.querySelectorAll(".active")
    let categories = [];
    activeBtns.forEach(btn => categories.push(btn.value))
    let myBody = {
      title: document.querySelector("#nameYourDream").value,
      description: document.querySelector("#description").value,
      date: document.querySelector("#date").value,
      categories: categories,
      status: "private"
    };
    fetch("/recordNoVoice", {
      method: "POST",
      body: JSON.stringify(myBody),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }) 
    .then(() => {
      console.log("no recording fetch done");
      window.location.href = "/dreams";
    })
    .catch((err) => console.log(err));
  } else {
    // There is a recording, we do all the xmlhttp and fetch logic
    rec.exportWAV(sendData);
  }
});
