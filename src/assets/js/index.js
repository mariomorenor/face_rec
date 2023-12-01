window.$ = require('jquery')
const moment = require('moment')

// Variables
const date = $("#date");
const time = $("#time");

const video_el = document.getElementById("video");


// Init Time Counter
function setDateTime() {
    date.text(moment().format("Y-MM-DD"));
    setInterval(() => {
        time.text(moment().format("hh:mm:ss"));
    }, 1000)
}


// VIDEO
async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video_el.srcObject = stream
    video_el.play();
}

setDateTime();
startCamera();
