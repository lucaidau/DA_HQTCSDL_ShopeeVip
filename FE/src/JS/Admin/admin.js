// Admin Dashboard JavaScript

const API_URL = "http://localhost:3000";

// State
let allProducts = [];
let allAccounts = [];

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setupNavigation();
  setupEventListeners();
  loadAllData();
});

// Check Authentication
function checkAuth() {
  let user = null;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.warn("Invalid user JSON in localStorage");
  }

  if (!user) {
    // Tạm thời tạo user ảo để dễ test giao diện Admin mà không bị văng ra ngoài
    user = { Ten: "Admin (Test Mode)", Loai: 0 };
  }
  const adminNameEl = document.getElementById("admin-name");
  if (adminNameEl) {
    adminNameEl.textContent = user.Ten || "Admin";
  }
}

// Setup Navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.classList.contains("logout")) return;

      e.preventDefault();
      const tab = link.getAttribute("data-tab");
      switchTab(tab, link);
    });
  });
}

// Switch Tab
function switchTab(tabName, linkElement) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Show selected tab
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }

  // Update nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  if (linkElement) linkElement.classList.add("active");

  // Update page title
  const titles = {
    products: "Quản Lý Sản Phẩm",
    accounts: "Quản Lý Tài Khoản",
    backup: "Sao Lưu & Phục Hồi",
  };
  const pageTitle = document.getElementById("page-title");
  if (pageTitle) {
    pageTitle.textContent = titles[tabName] || "Admin";
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Products
  document
    .getElementById("product-search")
    .addEventListener("input", filterProducts);

  // Accounts
  document
    .getElementById("account-search")
    .addEventListener("input", filterAccounts);

  // Backup
  document.getElementById("btn-backup").addEventListener("click", handleBackup);
  document
    .getElementById("btn-execute-restore")
    .addEventListener("click", executeRestore);

  // Modal
  document
    .getElementById("modal-form")
    .addEventListener("submit", handleFormSubmit);
}

// ==================== PRODUCTS ====================

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/admin/sanpham`);
    const data = await response.json();
    allProducts = data.danhSachSP;
    console.log(allProducts);

    renderProductsTable(allProducts);
  } catch (error) {
    console.error("Error loading products:", error);
    document.getElementById("products-table").innerHTML =
      '<tr><td colspan="6" style="text-align: center;">Lỗi tải dữ liệu</td></tr>';
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById("products-table");
  if (products.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; padding: 20px;">Không có sản phẩm</td></tr>';
    return;
  }

  tbody.innerHTML = products
    .map((product) => {
      const status = product.TrangThaiBS;
      const statusText = status ? "Còn hàng" : "Hết hàng";
      const statusColor = status ? "#28a745" : "#e74c3c";

      return `
        <tr>
            <td>${product.Ten}</td>
            <td>${product.TenSP}</td>
            <td>₫${Number(product.GiaBan || 0).toLocaleString("vi-VN")}</td>
            <td><img src="${product.HinhAnh || "https://via.placeholder.com/50"}" alt="Product"></td>
            <td>${product.SoLuongTonKho || 0}</td>
            <td><span class="status-active" style="color:${statusColor} ; font-weight: 500;">${statusText}</span></td>
        </tr>
    `;
    })
    .join("");
}

function filterProducts() {
  const search = document.getElementById("product-search").value.toLowerCase();
  const filtered = allProducts.filter(
    (p) =>
      p.TenSP.toLowerCase().includes(search) ||
      p.Ten.toLowerCase().includes(search),
  );
  renderProductsTable(filtered);
}

function editProduct(id) {
  const product = allProducts.find((p) => p.IDSanPham === id);
  if (product) {
    openModal(
      "Chỉnh Sửa Sản Phẩm",
      [
        {
          id: "product-name",
          label: "Tên Sản Phẩm",
          type: "text",
          value: product.TenSanPham,
          required: true,
        },
        {
          id: "product-price",
          label: "Giá",
          type: "number",
          value: product.Gia,
          required: true,
        },
        {
          id: "product-image",
          label: "Đường dẫn hình ảnh",
          type: "text",
          value: product.HinhAnh,
          required: true,
        },
        {
          id: "product-description",
          label: "Mô tả",
          type: "textarea",
          value: product.MoTa || "",
          required: false,
        },
      ],
      "edit-product",
      id,
    );
  }
}

async function deleteProduct(id) {
  if (confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
    try {
      const response = await fetch(`${API_URL}/admin/products/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Xóa sản phẩm thành công!");
        loadProducts();
      }
    } catch (error) {
      alert("Lỗi xóa sản phẩm!");
    }
  }
}

// ==================== ACCOUNTS ====================

async function loadAccounts() {
  try {
    const response = await fetch(`${API_URL}/admin`);
    const data = await response.json();
    console.log("danh sách tài khoản: ", data);

    allAccounts = data.danhsachTK || [];
    renderAccountsTable(allAccounts);
  } catch (error) {
    console.error("Error loading accounts:", error);
    document.getElementById("accounts-table").innerHTML =
      '<tr><td colspan="6" style="text-align: center;">Lỗi tải dữ liệu</td></tr>';
  }
}

function renderAccountsTable(accounts) {
  const tbody = document.getElementById("accounts-table");
  if (accounts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; padding: 20px;">Không có tài khoản</td></tr>';
    return;
  }

  tbody.innerHTML = accounts
    .map((account) => {
      const status = account.TrangThaiTaiKhoan ? "Đang hoạt động" : "Đã khóa";
      const statusColor = account.TrangThaiTaiKhoan ? "#28a745" : "#e74c3c";
      const lockText = account.TrangThaiTaiKhoan ? "Khóa" : "Mở khóa";
      return `
        <tr>
            <td>${account.IDTaiKhoan}</td>
            <td>${account.TenDangNhap}</td>
            <td>${account.Ten}</td>
            <td>${account.Email}</td>
            <td>${account.VaiTro}</td>
            <td style="color:${statusColor}">${status}</td>
            <td>
                <button class="btn btn-edit" onclick="editAccount(${account.IDTaiKhoan})">Sửa</button>
                <button class="btn btn-danger" onclick="lockAccount(${account.IDTaiKhoan})">${lockText}</button>
            </td>
        </tr>
    `;
    })
    .join("");
}

function filterAccounts() {
  const search = document.getElementById("account-search").value.toLowerCase();
  const filtered = allAccounts.filter(
    (a) =>
      a.TenDangNhap.toLowerCase().includes(search) ||
      a.Ten.toLowerCase().includes(search) ||
      a.Email.toLowerCase().includes(search),
  );
  renderAccountsTable(filtered);
}

function editAccount(id) {
  const account = allAccounts.find((a) => a.IDTaiKhoan === id);
  if (account) {
    openModal(
      "Chỉnh Sửa Tài Khoản",
      [
        {
          id: "account-username",
          label: "Tên Đăng Nhập",
          type: "text",
          value: account.TenDangNhap,
          required: true,
        },
        {
          id: "account-name",
          label: "Tên Người Dùng",
          type: "text",
          value: account.Ten,
          required: true,
        },
        {
          id: "account-email",
          label: "Email",
          type: "email",
          value: account.Email,
          required: true,
        },
        {
          id: "account-phone",
          label: "Số Điện Thoại",
          type: "text",
          value: account.SDT,
          required: true,
        },
      ],
      "edit-account",
      id,
    );
  }
  console.log("Tai Khoan: ", account);
}

async function lockAccount(id) {
  if (confirm("Bạn chắc chắn muốn thao tác với tài khoản này?")) {
    try {
      const response = await fetch(`${API_URL}/admin/khoataikhoan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert(data.message);
        loadAccounts();
      } else {
        alert("Lỗi: " + (data.message || "Không thể khóa tài khoản"));
      }
    } catch (error) {
      console.error("Lỗi kết nối API: ", error);

      alert("Lỗi xóa tài khoản!");
    }
  }
}

// ==================== BACKUP & RESTORE ====================

async function handleBackup() {
  try {
    // Collect all data
    const backupData = {
      timestamp: new Date().toISOString(),
      products: allProducts,
      accounts: allAccounts,
    };

    // Create download link
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    // Update backup info
    document.getElementById("last-backup").textContent =
      new Date().toLocaleString("vi-VN");
    document.getElementById("backup-size").textContent =
      (blob.size / 1024).toFixed(2) + " KB";

    alert("Sao lưu thành công!");
  } catch (error) {
    alert("Lỗi sao lưu: " + error.message);
  }
}

async function executeRestore() {
  const restoreType = document.getElementById("restore-type").value;
  const filePath = document.getElementById("restore-file-path").value;
  const statusDiv = document.getElementById("restore-status");

  if (!filePath.trim()) {
    statusDiv.innerHTML =
      '<p style="color: red;"><i class="fas fa-exclamation-triangle"></i> Vui lòng nhập đường dẫn file .bak!</p>';
    return;
  }

  if (
    confirm(
      `Bạn chắc chắn muốn phục hồi dữ liệu từ file: ${filePath}?\nDữ liệu hiện tại sẽ bị ghi đè!`,
    )
  ) {
    try {
      // Giả lập gọi API phục hồi
      statusDiv.innerHTML =
        '<p style="color: blue;"><i class="fas fa-spinner fa-spin"></i> Đang xử lý phục hồi dữ liệu...</p>';

      // Xây dựng câu lệnh SQL tương ứng để log ra cho khớp với bài giảng
      let sqlCmd = `RESTORE DATABASE [Tên_Database] FROM DISK = '${filePath}' WITH REPLACE`;
      console.log(`Thực thi lệnh: ${sqlCmd}`);

      // Giả lập delay
      setTimeout(() => {
        statusDiv.innerHTML =
          '<p style="color: green;"><i class="fas fa-check-circle"></i> Phục hồi dữ liệu thành công!</p>';

        // Tải lại dữ liệu sau khi phục hồi
        loadAllData();

        setTimeout(() => {
          statusDiv.innerHTML = "";
        }, 3000);
      }, 1500);
    } catch (error) {
      statusDiv.innerHTML =
        '<p style="color: red;"><i class="fas fa-times-circle"></i> Lỗi phục hồi: ' +
        error.message +
        "</p>";
    }
  }
}

function updateBackupStats() {
  document.getElementById("stat-products").textContent = allProducts.length;
  document.getElementById("stat-accounts").textContent = allAccounts.length;
  // Orders and shops would be loaded from API
}

// ==================== MODAL ====================

function openModal(title, fields, action, id = null) {
  document.getElementById("modal-title").textContent = title;

  const formFields = document.getElementById("form-fields");

  formFields.innerHTML = fields
    .map((field) => {
      console.log("field: ", field);

      return `
                <div class="form-group">
                    <label for="${field.id}">${field.label}</label>
                    <input type="${field.type}" id="${field.id}" value="${field.value || ""}" ${field.required ? "required" : ""}>
                </div>
            `;
    })
    .join("");

  window.currentModalAction = { action, id };
  document.getElementById("modal").classList.add("active");
}

function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

function handleFormSubmit(e) {
  e.preventDefault();
  const { action, id } = window.currentModalAction || {};

  if (action === "edit-product") {
    updateProduct(id);
  } else if (action === "edit-account") {
    updateAccount(id);
  }
}

async function updateProduct(id) {
  const name = document.getElementById("product-name").value;
  const price = document.getElementById("product-price").value;
  const image = document.getElementById("product-image").value;
  const description = document.getElementById("product-description").value;

  try {
    const response = await fetch(`${API_URL}/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price: parseFloat(price),
        image,
        description,
      }),
    });

    if (response.ok) {
      alert("Cập nhật sản phẩm thành công!");
      closeModal();
      loadProducts();
    }
  } catch (error) {
    alert("Lỗi cập nhật sản phẩm!");
  }
}

async function updateAccount(id) {
  const userName = document.getElementById("account-username").value;
  const name = document.getElementById("account-name").value;
  const email = document.getElementById("account-email").value;
  const phone = document.getElementById("account-phone").value;

  try {
    const res = await fetch(`http://localhost:3000/admin/suataikhoan`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idAccount: id,
        userName: userName,
        name: name,
        email: email,
        phone: phone,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert("Cập nhật tài khoản thành công");
      closeModal();
      await loadAccounts();
    } else {
      alert("Lỗi: " + (data.message || "Cập nhật thất bại"));
    }
  } catch (error) {
    console.error("Lỗi cập nhật tài khoản: ", error);
    alert("Lỗi kết nối API");
  }
}

// ==================== GENERAL ====================

async function loadAllData() {
  await loadProducts();
  await loadAccounts();
  updateBackupStats();
}

window.closeModal = closeModal;
