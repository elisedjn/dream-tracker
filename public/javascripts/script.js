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
//new audio context to help us record 
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
//add events to those 3 buttons 
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);


function startRecording() { console.log("recordButton clicked"); 
var constraints = {
  audio: true,
  video: false
} 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext;

/* Disable the record button until we get a success or fail from getUserMedia() */
recordButton.disabled = true;
stopButton.disabled = false;

// We're using the standard promise based getUserMedia()
navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
  console.log("getUserMedia() success, stream created, initializing Recorder.js ..."); 
  /* assign to gumStream for later use */
  gumStream = stream;
  /* use the stream */
  input = audioContext.createMediaStreamSource(stream);
  /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
  rec = new Recorder(input, {
      numChannels: 1
  }) 
  //start the recording process 
  rec.record()
  console.log("Recording started");
}).catch(function(err) {
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
  //create the wav blob and pass it on to createDownloadLink 
  rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');

	//name of .wav file to use during upload and download (without extendion)
  var filename = new Date().toISOString();

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;


	//add the new audio element to li
	li.appendChild(au);
	
	//add the filename to the li
	li.appendChild(document.createTextNode(filename))
	
	//upload linked to the submit button of the form
	var upload = document.getElementById("submitBtn");
	upload.addEventListener("click", function(event){
    // XMLHTTP Request
		  var xhr=new XMLHttpRequest();
		  xhr.onload=function(e) {
		      if(this.readyState === 4) {
		          console.log("Server returned: ",e.target.responseText);
		      }
      };
      var fd=new FormData();
      fd.append("audio_data",blob, filename);
      xhr.open("POST","/upload",true);
      
      let myBody = {
        title: document.querySelector("#nameYourDream").value,
        description: document.querySelector("#description").value,
        date: document.querySelector("#date").value,
        categories: ["Action"]
      }

      console.log(myBody)

      fetch('https://localhost:3000/record', {
        method: POST,
        body: JSON.stringify(myBody)
      })
      .then(() => {
        console.log("fetch done")
        xhr.send(fd);
      })
      .catch((err) => console.log(err))
      
	})

	//add the li element to the ol
	recordingsList.appendChild(li);
}