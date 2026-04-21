const categories = ["Thời trang", "Giày dép", "Điện thoại", "Phụ kiện", "Đồ gia dụng"];
const productNames = {
  "Thời trang": ["Áo Thun", "Quần Jean", "Áo Sơ Mi", "Váy Nữ", "Đầm Dạ Hội"],
  "Giày dép": ["Giày Thể Thao", "Dép Sandal", "Giày Cao Gót", "Giày Slip-on"],
  "Điện thoại": ["Ốp Lưng", "Sạc Dự Phòng", "Tai Nghe Bluetooth", "Cáp Sạc"],
  "Phụ kiện": ["Móc Khóa", "Balo", "Nón Lưỡi Trai", "Mặt Nạ"],
  "Đồ gia dụng": ["Bình Nước", "Ly Thủy Tinh", "Đèn Bàn", "Dụng Cụ Nhà Bếp"],
};
const statuses = ["Đang bán", "Hết hàng", "Ẩn"];
const itemsPerPage = 6;
let currentPage = 1;
let products = [];

const productTableBody = document.getElementById("productTableBody");
const paginationContainer = document.getElementById("pagination");

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateSku = (name, idx) => {
  const code = name
    .replace(/[^0-9a-zA-Z]/g, "")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return `${code}${String(idx).padStart(3, "0")}`;
};

const generateProducts = (count) => {
  const items = [];
  for (let i = 1; i <= count; i++) {
    const category = categories[randomInt(0, categories.length - 1)];
    const nameList = productNames[category];
    const baseName = nameList[randomInt(0, nameList.length - 1)];
    const name = `${baseName} ${randomInt(1, 99)}`;
    const sku = generateSku(baseName, i);
    const price = randomInt(20000, 750000);
    const stock = randomInt(0, 120);
    const status = stock === 0 ? "Hết hàng" : statuses[randomInt(0, statuses.length - 1)];

    items.push({
      id: i,
      image: `https://picsum.photos/seed/prod${i}/80/80`,
      name,
      sku,
      price,
      stock,
      status,
      category,
    });
  }
  return items;
};

products = generateProducts(24);
const savedProducts = JSON.parse(localStorage.getItem("tatcasanpham_extra_products") || "[]");
if (savedProducts.length) {
  products = [...savedProducts, ...products];
}
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const statusSelect = document.getElementById("statusSelect");
const priceMin = document.getElementById("priceMin");
const priceMax = document.getElementById("priceMax");
const newProductBtn = document.getElementById("newProductBtn");
const selectAllCheckbox = document.getElementById("selectAll");

const formatPrice = (value) => {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
};

const getStatusClass = (status) => {
  if (status === "Đang bán") return "status-pill status-sell";
  if (status === "Hết hàng") return "status-pill status-out";
  return "status-pill status-hide";
};

const renderProducts = (items) => {
  if (!productTableBody) return;
  productTableBody.innerHTML = items
    .map(
      (product) => `
      <tr>
        <td><input type="checkbox" class="row-checkbox" data-id="${product.id}" /></td>
        <td><img src="${product.image}" alt="${product.name}" /></td>
        <td>
          <div class="product-info">
            <div>
              <div class="product-name">${product.name}</div>
              <div class="product-sku">${product.sku}</div>
              <div class="product-category">${product.category}</div>
            </div>
          </div>
        </td>
        <td>${formatPrice(product.price)}</td>
        <td>${product.stock}</td>
        <td><span class="${getStatusClass(product.status)}">${product.status}</span></td>
        <td>
          <div class="action-links">
            <button class="edit" data-id="${product.id}">Sửa</button>
            <button class="delete" data-id="${product.id}">Xóa</button>
            <button class="view-detail" data-id="${product.id}">Xem chi tiết</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
};

const renderPagination = (totalPages) => {
  if (!paginationContainer) return;
  let buttonsHtml = `<span>Trang:</span>`;

  const addButton = (page, label, active = false, disabled = false) => {
    buttonsHtml += `<button class="page-btn${active ? " active" : ""}${disabled ? " disabled" : ""}" data-page="${page}"${disabled ? " disabled" : ""}>${label}</button>`;
  };

  addButton(Math.max(1, currentPage - 1), "Prev", false, currentPage === 1);

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      addButton(page, page, page === currentPage);
    }
  } else {
    addButton(1, 1, currentPage === 1);
    if (currentPage > 3) {
      buttonsHtml += `<span>...</span>`;
    }
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    for (let page = startPage; page <= endPage; page += 1) {
      addButton(page, page, page === currentPage);
    }
    if (currentPage < totalPages - 2) {
      buttonsHtml += `<span>...</span>`;
    }
    addButton(totalPages, totalPages, currentPage === totalPages);
  }

  addButton(Math.min(totalPages, currentPage + 1), "Next", false, currentPage === totalPages);
  paginationContainer.innerHTML = buttonsHtml;

  document.querySelectorAll(".page-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const targetPage = Number(button.dataset.page);
      if (!targetPage || targetPage === currentPage) return;
      currentPage = targetPage;
      filterProducts(false);
    });
  });
};

const showPage = (filtered) => {
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(start, start + itemsPerPage);
  renderProducts(pageItems);
  bindProductActions();
  renderPagination(totalPages);
};

const filterProducts = (resetPage = false) => {
  if (resetPage) currentPage = 1;
  const search = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const status = statusSelect.value;
  const min = Number(priceMin.value);
  const max = Number(priceMax.value);

  const filtered = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search);
    const matchesStatus = status ? product.status === status : true;
    const matchesCategory = category ? product.category === category : true;
    const matchesMin = min ? product.price >= min : true;
    const matchesMax = max ? product.price <= max : true;

    return matchesSearch && matchesStatus && matchesCategory && matchesMin && matchesMax;
  });

  showPage(filtered);
};

const clearFilters = () => {
  searchInput.value = "";
  categorySelect.value = "";
  statusSelect.value = "";
  priceMin.value = "";
  priceMax.value = "";
  filterProducts();
};

const addProduct = (product) => {
  products.push(product);
  filterProducts();
};

const deleteProduct = (id) => {
  const result = confirm("Bạn có chắc muốn xóa sản phẩm này?");
  if (!result) return;
  const index = products.findIndex((item) => item.id === id);
  if (index > -1) {
    products.splice(index, 1);
    filterProducts();
  }
};

const editProduct = (id) => {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const name = prompt("Tên sản phẩm", product.name);
  if (name === null) return;
  const sku = prompt("SKU", product.sku);
  if (sku === null) return;
  const price = Number(prompt("Giá bán", product.price));
  if (Number.isNaN(price)) return alert("Giá không hợp lệ");
  const stock = Number(prompt("Kho hàng", product.stock));
  if (Number.isNaN(stock)) return alert("Số lượng không hợp lệ");
  const status = prompt("Trạng thái (Đang bán/Hết hàng/Ẩn)", product.status);
  if (status === null) return;

  product.name = name.trim() || product.name;
  product.sku = sku.trim() || product.sku;
  product.price = price;
  product.stock = stock;
  product.status = status.trim() || product.status;

  filterProducts();
};

const viewProduct = (id) => {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  alert(
    `Tên sản phẩm: ${product.name}\nSKU: ${product.sku}\nGiá: ${formatPrice(product.price)}\nKho hàng: ${product.stock}\nTrạng thái: ${product.status}`
  );
};

const bindProductActions = () => {
  document.querySelectorAll(".edit").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      editProduct(id);
    });
  });

  document.querySelectorAll(".delete").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      deleteProduct(id);
    });
  });

  document.querySelectorAll(".view-detail").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      viewProduct(id);
    });
  });
};

selectAllCheckbox?.addEventListener("change", (event) => {
  const checkboxes = document.querySelectorAll(".row-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = event.target.checked;
  });
});

searchInput?.addEventListener("input", () => filterProducts(true));
categorySelect?.addEventListener("change", () => filterProducts(true));
statusSelect?.addEventListener("change", () => filterProducts(true));
priceMin?.addEventListener("input", () => filterProducts(true));
priceMax?.addEventListener("input", () => filterProducts(true));
newProductBtn?.addEventListener("click", () => {
  window.location.href = "themsanpham.html";
});

window.addEventListener("DOMContentLoaded", () => {
  filterProducts(true);
});
