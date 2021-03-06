// access users webcam and dump into video element
const video = document.querySelector('.webcam');
// take frames from the video, put square round face
const canvas = document.querySelector('.video');
const ctx = canvas.getContext('2d');
ctx.strokeStyle = '#ffc600';
ctx.lineWidth = 2;
// pixelate face
const faceCanvas = document.querySelector('.face');
const faceCtx = faceCanvas.getContext('2d');

// FaceDetector api does not exist in node js land so is why we use window.
const faceDetector = new window.FaceDetector({ fastMode: true });
const SIZE = 10;

// console.log(video, canvas, faceCanvas, faceDetector);

// write a function that will populate the users video
async function populateVideo() {
  // grab stream from users webcam
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
  });
  // put media stream into video object
  video.srcObject = stream;
  await video.play();
  // size canvas to be the same size as the video
  // console.log(video.videoWidth, video.videoHeight);
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  faceCanvas.width = video.videoWidth;
  faceCanvas.height = video.videoHeight;
}

async function detect() {
  const faces = await faceDetector.detect(video);
  // console.log(faces.length);

  faces.forEach(drawFace);
  faces.forEach(censor);
  // ask the browser when the next animation frame is, and tell it to run detect. This is recursion
  requestAnimationFrame(detect);
}

// draw rectangle round users face
function drawFace(face) {
  const { width, height, top, left } = face.boundingBox;
  // clear amount of width and height starting at top left so you only get one square
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ffc600';
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, height, width);
}

// pixelate users face, use detsructuring for the parameter so you don't need to declare a variable inside the function
// like const faceDetails = face.boundingBox;
// rename boundingBox variable to face
function censor({ boundingBox: face }) {
  faceCtx.imageSmoothingEnabled = false;
  faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
  // draw the small face
  faceCtx.drawImage(
    // 5 source args
    video, // where does the source come from
    face.x, // where do we start the source pull from
    face.y,
    face.width,
    face.height,
    // 4 draw args
    face.x, // where should we start drawing the x and y
    face.y,
    SIZE,
    SIZE
  );
  // take face back out and draw it back at normal size
  faceCtx.drawImage(
    faceCanvas, // source
    face.x,
    face.y,
    SIZE,
    SIZE,
    // drawing args
    face.x,
    face.y,
    face.width,
    face.height
  );
}
populateVideo().then(detect);
