document.getElementById("inspectionDT").value = new Date().toLocaleString();

function goToRoomInspection() {
  const propertyData = {
    propertyName: document.getElementById("propertyName").value.trim(),
    address: document.getElementById("address").value.trim(),
    type: document.getElementById("propertyType").value,
    carpetArea: document.getElementById("carpetArea").value,
    floor: document.getElementById("floor").value,
    furnishing: document.getElementById("furnishing").value,
    inspectionDT: document.getElementById("inspectionDT").value,
  };

  const ownerData = {
    name: document.getElementById("ownerName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
  };

  // Basic Validation
  if (!propertyData.propertyName || !propertyData.address || !ownerData.name || !ownerData.phone ) {
    alert("Please fill in all required fields.");
    return;
  }

  // Save to session
  sessionStorage.setItem("propertyData", JSON.stringify(propertyData));
  sessionStorage.setItem("ownerData", JSON.stringify(ownerData));

  // Go to page 2
  window.location.href = "room-wise.html";
}
