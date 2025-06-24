const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
  .then(stream => {
    video.srcObject = stream;
    video.play();
  })
  .catch(err => alert("Unable to access front camera."));

function captureSelfie() {
  // ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  // Flip context horizontally (mirror fix)
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1,1); // mirror fix
  canvas.width = 640;
  canvas.height = 480;
  ctx.drawImage(video, 0, 0, 640, 480);
  ctx.restore();

  const dataURL = canvas.toDataURL('image/jpeg');
  document.getElementById('selfiePreview').src = dataURL;
  sessionStorage.setItem('selfie', dataURL);
}

function goToNext() {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const gender =
    document.querySelector('input[name="gender"]:checked')?.value || "";
  const hobbies = Array.from(document.querySelectorAll(".hobby:checked"))
    .map((cb) => cb.value)
    .join(", ");

  sessionStorage.setItem("name", name);
  sessionStorage.setItem("age", age);
  sessionStorage.setItem("gender", gender);
  sessionStorage.setItem("hobbies", hobbies);

  if (!sessionStorage.getItem("selfie")) {
    alert("Please capture a selfie.");
    return;
  }

  window.location.href = "propInfo.html";
}
