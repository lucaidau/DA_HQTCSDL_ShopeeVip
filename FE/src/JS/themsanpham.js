const categoryInput = document.getElementById("categoryInput");
const productNameInput = document.getElementById("productName");
const descriptionInput = document.getElementById("description");
const priceInput = document.getElementById("priceInput");
const stockInput = document.getElementById("stockInput");
const weightInput = document.getElementById("weightInput");
const shippingInput = document.getElementById("shippingInput");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");
const formMessage = document.getElementById("formMessage");
const fileInputs = document.querySelectorAll(".file-input");

const categories = ["Thời trang", "Giày dép", "Điện thoại", "Phụ kiện", "Đồ gia dụng"];
let selectedImageData = null;

const updateImagePreview = (input) => {
  const box = input.closest(".upload-box");
  if (!box) return;
  const file = input.files[0];
  if (!file) {
    box.style.backgroundImage = "";
    box.dataset.image = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const imageData = reader.result;
    box.style.backgroundImage = `url('${imageData}')`;
    box.style.backgroundSize = "cover";
    box.style.backgroundPosition = "center";
    box.dataset.image = imageData;
    selectedImageData = imageData;
    box.querySelector(".upload-icon").style.display = "none";
    box.querySelector(".upload-text").textContent = "Đã chọn";
  };
  reader.readAsDataURL(file);
};

fileInputs.forEach((input) => {
  input.addEventListener("change", () => updateImagePreview(input));
});

const generateSku = (name) => {
  return name
    .replace(/[^0-9a-zA-Z]/g, " ")
    .split(" ")
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 6);
};

const showMessage = (message, type = "success") => {
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
};

const saveProduct = () => {
  const name = productNameInput.value.trim();
  const category = categoryInput.value;
  const price = Number(priceInput.value);
  const stock = Number(stockInput.value);
  const description = descriptionInput.value.trim();

  if (!name || !category || !description) {
    showMessage("Vui lòng điền đầy đủ thông tin bắt buộc.", "error");
    return;
  }

  const image = selectedImageData
    ? selectedImageData
    : `https://picsum.photos/seed/new${Date.now()}/220/220`;
  const newProduct = {
    id: Date.now(),
    name,
    sku: generateSku(name) || `SP${Date.now()}`,
    price: Number.isNaN(price) ? 0 : price,
    stock: Number.isNaN(stock) ? 0 : stock,
    status: stock > 0 ? "Đang bán" : "Hết hàng",
    category,
    image,
    description,
    weight: Number.isNaN(Number(weightInput.value)) ? 0 : Number(weightInput.value),
    shipping: shippingInput.value.trim(),
  };

  const savedProducts = JSON.parse(localStorage.getItem("tatcasanpham_extra_products") || "[]");
  savedProducts.unshift(newProduct);
  localStorage.setItem("tatcasanpham_extra_products", JSON.stringify(savedProducts));

  showMessage("Sản phẩm đã lưu. Chuyển về trang danh sách...");
  setTimeout(() => {
    window.location.href = "tatcasanpham.html";
  }, 1200);
};

saveBtn?.addEventListener("click", saveProduct);
backBtn?.addEventListener("click", () => {
  window.location.href = "tatcasanpham.html";
});
