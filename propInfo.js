const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gallery = document.getElementById("gallery");
let surroundingImages = [];

navigator.mediaDevices
.getUserMedia({ video: { facingMode: { exact: "environment" } } })
.then((stream) => (video.srcObject = stream))
.catch(() =>
navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => (video.srcObject = stream))
    .catch((err) => alert("Camera not accessible."))
);

function captureSurrounding() {
// ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
canvas.width = 640;
canvas.height = 480;
ctx.drawImage(video, 0, 0, 640, 480);
const dataURL = canvas.toDataURL("image/jpeg");
surroundingImages.push(dataURL);
const img = document.createElement("img");
img.src = dataURL;
img.style.cursor = "pointer";
img.title = "Click to delete this photo";

img.addEventListener("click", function () {
// Remove image from DOM
gallery.removeChild(img);
// Remove image from array
surroundingImages = surroundingImages.filter((url) => url !== dataURL);
});

gallery.appendChild(img);
}

function downloadPDF() {
const name = sessionStorage.getItem("name");
const age = sessionStorage.getItem("age");
const gender = sessionStorage.getItem("gender");
const hobbies = sessionStorage.getItem("hobbies");
const selfie = sessionStorage.getItem("selfie");
const filename =
(document.getElementById("pdfName").value || "User_Info") + ".pdf";

let pdfContent = document.createElement("div");
let imgs = surroundingImages
.map(
    (src) =>
    `<img src="${src}" style="display:block; margin: 10px auto; max-width: 100%;">`
)
.join("");

pdfContent.innerHTML = `
    <div style="font-family: Arial; padding: 20px;">
        <h2>User Information</h2>
        <div style="display:flex">
            <img src="${selfie}" style="width: 140px; height: 180px; margin:10px auto; transform: scaleX(-1);">
            <div>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Age:</strong> ${age}</p>
                <p><strong>Gender:</strong> ${gender}</p>
                <p><strong>Hobbies:</strong> ${hobbies}</p>
            </div>
        </div>
        <hr />
        <h3>Surroundings:</h3>
        ${imgs}
    </div>
    `;

html2pdf()
.set({
    margin: 10,
    filename: filename,
    image: { type: "jpeg", quality: 1},
    html2canvas: { scale: 4, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
})
.from(pdfContent)
.save();
}
