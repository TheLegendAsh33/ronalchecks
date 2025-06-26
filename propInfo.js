let currentStream = null;
let aadhaarPhotos = [];

document.getElementById("inspectionDT").value = new Date().toLocaleString();

function startCamera(type) {
  stopCamera(); // Stop if already running

  const facingMode = (type === 'aadhaar') ? 'user' : { exact: "environment" };
  const videoElem = document.getElementById(`${type}Video`);

  navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } })
    .then(stream => {
      currentStream = stream;
      videoElem.srcObject = stream;
      videoElem.style.display = "block";
      videoElem.play();
    })
    .catch(() => alert("Unable to access camera."));
}

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
    document.getElementById("aadhaarVideo").style.display = "none";
    document.getElementById("ownerVideo").style.display = "none";
  }
}

function capturePhoto(type) {
  const videoElem = document.getElementById(`${type}Video`);
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoElem, 0, 0, 640, 480);
  const dataURL = canvas.toDataURL("image/jpeg");

  if (type === 'aadhaar') {
    if (aadhaarPhotos.length >= 2) {
      alert("Only 2 Aadhaar images allowed.");
      return;
    }
    aadhaarPhotos.push(dataURL);
    sessionStorage.setItem("aadhaarPhotos", JSON.stringify(aadhaarPhotos));

    const img = document.createElement("img");
    img.src = dataURL;
    img.style.width = "150px";
    img.style.margin = "5px";
    document.getElementById("aadhaarPreview").appendChild(img);

  } else if (type === 'owner') {
    document.getElementById("ownerPreview").src = dataURL;
    sessionStorage.setItem("ownerPhoto", dataURL);
  }

  stopCamera();
}

function goToRoomInspection() {
  const propertyData = {
    propertyName: document.getElementById("propertyName").value.trim(),
    address: document.getElementById("address").value.trim(),
    type: document.getElementById("propertyType").value,
    carpetArea: document.getElementById("carpetArea").value,
    floor: document.getElementById("floor").value,
    furnishing: document.getElementById("furnishing").value,
    balcony: document.getElementById("balcony").checked ? "Yes" : "No",
    inspectionDT: document.getElementById("inspectionDT").value,
  };

  const ownerData = {
    name: document.getElementById("ownerName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    aadhaar: document.getElementById("aadhaar").value.trim(),
  };

  // Basic Validation
  if (!propertyData.propertyName || !propertyData.address || !ownerData.name || !ownerData.phone || !ownerData.aadhaar) {
    alert("Please fill in all required fields.");
    return;
  }

  if (aadhaarPhotos.length === 0) {
    alert("Please capture Aadhaar photo(s).");
    return;
  }

  if (!sessionStorage.getItem("ownerPhoto")) {
    alert("Please capture Owner photo.");
    return;
  }

  // Save to session
  sessionStorage.setItem("propertyData", JSON.stringify(propertyData));
  sessionStorage.setItem("ownerData", JSON.stringify(ownerData));

  // Go to page 2
  window.location.href = "room-wise.html";
}
