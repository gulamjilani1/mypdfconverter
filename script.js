let selectedFiles = [];
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const preview = document.getElementById("preview");
const imageList = document.getElementById("imageList");
const convertBtn = document.getElementById("convertBtn");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");

browseBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const newFiles = Array.from(fileInput.files);
  selectedFiles = selectedFiles.concat(newFiles);
  fileInput.value = "";
  updatePreviewAndList();
});

function updatePreviewAndList() {
  preview.innerHTML = "";
  imageList.innerHTML = "";

  if (selectedFiles.length === 0) {
    imageList.innerHTML = '<li class="image-item empty">No images selected</li>';
    return;
  }

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      preview.appendChild(img);

      const li = document.createElement("li");
      li.className = "image-item";

      const thumb = document.createElement("img");
      thumb.src = e.target.result;
      thumb.className = "image-thumb";

      const nameDiv = document.createElement("div");
      nameDiv.className = "image-name";
      nameDiv.textContent = file.name;

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        updatePreviewAndList();
      });

      li.appendChild(thumb);
      li.appendChild(nameDiv);
      li.appendChild(removeBtn);
      imageList.appendChild(li);
    };
    reader.readAsDataURL(file);
  });
}

convertBtn.addEventListener("click", async () => {
  if (selectedFiles.length === 0) {
    alert("Please select images first!");
    return;
  }

  const orientation = document.getElementById("orientation").value;
  const pageSize = document.getElementById("pageSize").value;
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation, unit: "px", format: pageSize });

  for (let i = 0; i < selectedFiles.length; i++) {
    const imgData = await readFileAsDataURL(selectedFiles[i]);
    const img = new Image();
    img.src = imgData;
    await img.decode();

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
    const imgWidth = img.width * ratio;
    const imgHeight = img.height * ratio;

    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    if (i !== 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
  }

  const pdfBlob = pdf.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  downloadBtn.href = url;
  downloadBtn.download = "converted.pdf";
  downloadBtn.style.display = "inline-block";
});

resetBtn.addEventListener("click", () => {
  selectedFiles = [];
  preview.innerHTML = "";
  imageList.innerHTML = '<li class="image-item empty">No images selected</li>';
  downloadBtn.style.display = "none";
});

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}
