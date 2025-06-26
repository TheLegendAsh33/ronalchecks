const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gallery = document.getElementById("gallery");

let currentStream = null;
let capturedImages = {};

function startCamera(blockId) {
  stopCamera(); // stop any other stream first
  const videoElem = document.getElementById(`${blockId}_video`);

  navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } })
    .then(stream => {
      videoElem.srcObject = stream;
      videoElem.style.display = "block";
      videoElem.play();
      currentStream = stream;
    })
    .catch(() =>
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          videoElem.srcObject = stream;
          videoElem.style.display = "block";
          videoElem.play();
          currentStream = stream;
        })
        .catch(() => alert("Camera not accessible."))
    );
}

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }

  document.querySelectorAll("video").forEach(v => v.style.display = "none");
}

function capturePhoto(room, feature, blockId) {
  const videoElem = document.getElementById(`${blockId}_video`);
  canvas.width = 640;
  canvas.height = 480;
  ctx.drawImage(videoElem, 0, 0, 640, 480);
  const dataURL = canvas.toDataURL("image/jpeg");

  if (!capturedImages[room]) capturedImages[room] = {};
  if (!capturedImages[room][feature]) capturedImages[room][feature] = [];
  capturedImages[room][feature].push(dataURL);

  const img = document.createElement("img");
  img.src = dataURL;
  img.style.width = "150px";
  img.style.margin = "5px";
  img.style.cursor = "pointer";
  img.title = "Click to delete";

  img.addEventListener("click", () => {
    img.remove();
    const index = capturedImages[room][feature].indexOf(dataURL);
    if (index > -1) {
      capturedImages[room][feature].splice(index, 1);
    }
  });

  document.getElementById(`${blockId}_preview`).appendChild(img);
}



function createFeatureBlock(room, feature, label) {
  const blockId = `${room}_${feature}`;
  const container = document.createElement("div");
  container.innerHTML = `
    <h4>${label}</h4>
    <video id="${blockId}_video" style="display:none;" autoplay playsinline></video>
    <div>
      <button onclick="startCamera('${blockId}')">Open Camera</button>
      <button onclick="capturePhoto('${room}', '${feature}', '${blockId}')">Take Photo</button>
    </div>
    <div id="${blockId}_preview" class="preview-area"></div>
    <label><input type="radio" name="${blockId}_status" value="Good" /> Good</label>
    <label><input type="radio" name="${blockId}_status" value="Fix Required" /> Fix Required</label>
  `;
  return container;
}

function buildRoomInspection() {
  const data = JSON.parse(sessionStorage.getItem("propertyData"));
  const bhk = data.type; // 1bhk, 2bhk, etc.
  const count = parseInt(bhk[0]);
  const section = document.getElementById("inspectionSection");

  for (let i = 1; i <= count; i++) {
    const room = `bedroom${i}`;
    const roomDiv = document.createElement("div");
    roomDiv.innerHTML = `<h3>Bedroom ${i}</h3>`;
    roomDiv.appendChild(createFeatureBlock(room, 'switches', 'Switches'));
    roomDiv.appendChild(createFeatureBlock(room, 'door', 'Doors & Locks'));
    roomDiv.appendChild(createFeatureBlock(room, 'walls', 'Paint & Walls'));
    roomDiv.appendChild(createFeatureBlock(room, 'pest', 'Pest Signs'));

    const balconyCheck = document.createElement("div");
    balconyCheck.innerHTML = `
      <label>Balcony? 
        <select onchange="toggleBalcony('${room}', this)">
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </label>
      <div id="${room}_balcony_container"></div>
    `;
    roomDiv.appendChild(balconyCheck);

    const bathCheck = document.createElement("div");
    bathCheck.innerHTML = `
      <label>Attached Bathroom? 
        <select onchange="toggleBathroom('${room}', this)">
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </label>
      <div id="${room}_bathroom_container"></div>
    `;
    roomDiv.appendChild(bathCheck);

    section.appendChild(roomDiv);
  }
}

function toggleBalcony(room, el) {
  const container = document.getElementById(`${room}_balcony_container`);
  container.innerHTML = '';
  if (el.value === "yes") {
    container.appendChild(createFeatureBlock(room, "balcony", "Balcony Photos"));
  }
}

function toggleBathroom(room, el) {
  const container = document.getElementById(`${room}_bathroom_container`);
  container.innerHTML = '';
  if (el.value === "yes") {
    container.appendChild(createFeatureBlock(room, "bathroom", "Attached Bathroom Plumbing"));
  }
}

function downloadPDF() {
  const propertyData = JSON.parse(sessionStorage.getItem("propertyData"));
  const ownerData = JSON.parse(sessionStorage.getItem("ownerData"));
  const ownerPhoto = sessionStorage.getItem("ownerPhoto");
  const aadhaarPhotos = JSON.parse(sessionStorage.getItem("aadhaarPhotos") || "[]");

  let html = `<div style="font-family:Arial; padding:20px;">`;
  html += `<h2>Property & Owner Info</h2>`;
  html += `<p><strong>Property:</strong> ${propertyData.propertyName}, ${propertyData.type}, ${propertyData.carpetArea} sqft, Floor ${propertyData.floor}, ${propertyData.furnishing}</p>`;
  html += `<p><strong>Address:</strong> ${propertyData.address}</p>`;
  html += `<p><strong>Inspection:</strong> ${propertyData.inspectionDT}</p>`;
  html += `<p><strong>Owner:</strong> ${ownerData.name}, ${ownerData.phone}, Aadhaar: ${ownerData.aadhaar}</p>`;

  if (ownerPhoto) {
    html += `<img src="${ownerPhoto}" style="width:120px; height:150px; float:right;" />`;
  }

  aadhaarPhotos.forEach(photo => {
    html += `<img src="${photo}" style="width:120px; height:150px; margin-right:5px;" />`;
  });

  html += `<hr/><h3>Room-wise Inspection</h3>`;

  Object.entries(capturedImages).forEach(([room, features]) => {
    html += `<h4>${room}</h4>`;
    Object.entries(features).forEach(([feature, images]) => {
      html += `<p><strong>${feature}:</strong></p>`;
      images.forEach(src => {
        html += `<img src="${src}" style="width:150px; height:100px; margin:5px;" />`;
      });
      const status = document.querySelector(`input[name="${room}_${feature}_status"]:checked`);
      html += `<p>Status: ${status ? status.value : 'Not selected'}</p>`;
    });
  });

  html += `</div>`;

  const filename = (document.getElementById("pdfName").value || "Property_Inspection") + ".pdf";

  html2pdf().set({
    margin: 10,
    filename: filename,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  }).from(html).save();
}

buildRoomInspection();
