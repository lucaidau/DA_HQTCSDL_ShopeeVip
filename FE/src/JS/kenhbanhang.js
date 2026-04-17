// --- QUẢN LÝ PANELS ---
function togglePanel(panelId) {
  document.querySelectorAll(".panel").forEach((p) => {
    if (p.id !== panelId) p.classList.remove("show");
  });
  document.getElementById(panelId).classList.toggle("show");
}

window.onclick = function (event) {
  if (!event.target.closest(".header-right")) {
    document
      .querySelectorAll(".panel")
      .forEach((p) => p.classList.remove("show"));
  }
  if (
    !event.target.closest(".loc-selector-box") &&
    !event.target.closest("#loc-dropdown")
  ) {
    document.getElementById("loc-dropdown").style.display = "none";
  }
};

// --- TOGGLE TAB THÔNG BÁO / CHAT ---
function toggleNotiTab(element) {
  let siblings = element.parentElement.children;
  for (let s of siblings) s.classList.remove("active");
  element.classList.add("active");

  // Ẩn hiện sub-pill nếu ko phải tab Shop
  let pills = document.getElementById("noti-pills-container");
  if (element.innerText === "Shop") pills.style.display = "flex";
  else pills.style.display = "none";
}

function togglePill(element) {
  let siblings = element.parentElement.children;
  for (let s of siblings) s.classList.remove("active");
  element.classList.add("active");
}

function toggleChatTab(element) {
  let siblings = element.parentElement.children;
  for (let s of siblings) s.classList.remove("active");
  element.classList.add("active");
}

// --- ĐIỀU HƯỚNG FORM ---
function showForm() {
  document.getElementById("welcome-section").style.display = "none";
  document.getElementById("form-section").style.display = "block";
}

let isAddressSaved = false;
function openModal() {
  document.getElementById("address-modal").style.display = "flex";
}
function closeModal() {
  document.getElementById("address-modal").style.display = "none";
}
function saveAddress() {
  let name = document.getElementById("address-name").value.trim();
  let phone = document.getElementById("address-phone").value.trim();
  let detail = document.getElementById("address-detail").value.trim();

  if (!name) {
    alert("Vui lòng nhập Họ & Tên!");
    return;
  }
  if (!phone) {
    alert("Vui lòng nhập Số điện thoại!");
    return;
  }
  let phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    alert("Số điện thoại không hợp lệ!");
    return;
  }
  if (
    document.getElementById("loc-selected-text").innerText === "Chọn" ||
    !selectedLocation.w
  ) {
    alert(
      "Vui lòng chọn đầy đủ cấp hành chính (Tỉnh/Thành Phố, Quận/Huyện, Phường/Xã)!",
    );
    return;
  }
  if (!detail) {
    alert("Vui lòng nhập Địa chỉ chi tiết!");
    return;
  }

  isAddressSaved = true;
  document.getElementById("saved-address").style.display = "inline-block";
  closeModal();
}

function completeRegistration(event) {
  event.preventDefault();

  let shopName = document.getElementById("shop-name-input").value.trim();
  let phone = document.getElementById("phone-input").value.trim();

  if (!shopName) {
    alert("Vui lòng nhập Tên Shop!");
    return false;
  }

  if (!isAddressSaved) {
    alert("Vui lòng click '+ Thêm' để nhập địa chỉ lấy hàng nhé!");
    return false;
  }

  if (!phone) {
    alert("Vui lòng nhập Số điện thoại!");
    return false;
  }

  let phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    alert("Số điện thoại không hợp lệ! Vui lòng kiểm tra lại.");
    return false;
  }

  // Update user info
  let userAvatarTextNode = document.querySelector(".user-avatar").nextSibling;
  if (userAvatarTextNode) userAvatarTextNode.nodeValue = " " + shopName + " ▾";
  let panelHeaderStrong = document.querySelector(".user-panel-header strong");
  if (panelHeaderStrong) panelHeaderStrong.innerText = shopName;

  document.getElementById("form-section").style.display = "none";
  document.querySelector(".header-title").innerText =
    "Kênh Người Bán - Bảng Điều Khiển";
  document.getElementById("dashboard-section").style.display = "block";
  updatePieChart(); // Init chart
}

let addressData = [];
fetch("https://provinces.open-api.vn/api/?depth=3")
  .then((res) => res.json())
  .then((data) => {
    addressData = data;
  })
  .catch((err) => console.error("Lỗi tải API địa chỉ:", err));

let selectedLocation = { p: "", d: "", w: "" };

function toggleLocationDropdown(e) {
  e.stopPropagation();
  if (addressData.length === 0) {
    alert("Đang tải dữ liệu địa chỉ, vui lòng đợi giây lát...");
    return;
  }
  let box = document.getElementById("loc-dropdown");
  box.style.display = box.style.display === "block" ? "none" : "block";
  if (!selectedLocation.p)
    renderLocList(
      addressData.map((p) => p.name),
      "p",
    );
}

function switchLocTab(tab) {
  document
    .querySelectorAll(".loc-tab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById("tab-" + tab).classList.add("active");
}

function clickLocTab(type) {
  if (addressData.length === 0) return;
  if (type === "p") {
    switchLocTab("province");
    renderLocList(
      addressData.map((p) => p.name),
      "p",
    );
  } else if (type === "d") {
    if (!selectedLocation.p)
      return alert("Vui lòng chọn Tỉnh/Thành phố trước!");
    switchLocTab("district");
    const pData = addressData.find((p) => p.name === selectedLocation.p);
    renderLocList(pData ? pData.districts.map((d) => d.name) : [], "d");
  } else if (type === "w") {
    if (!selectedLocation.d) return alert("Vui lòng chọn Quận/Huyện trước!");
    switchLocTab("ward");
    const pData = addressData.find((p) => p.name === selectedLocation.p);
    const dData = pData
      ? pData.districts.find((d) => d.name === selectedLocation.d)
      : null;
    renderLocList(dData ? dData.wards.map((w) => w.name) : [], "w");
  }
}

function renderLocList(dataArray, type) {
  let listDiv = document.getElementById("loc-list-items");
  listDiv.innerHTML = "";
  dataArray.forEach((itemStr) => {
    let div = document.createElement("div");
    div.className = "loc-item";
    div.innerText = itemStr;
    div.onclick = function () {
      if (type === "p") {
        if (selectedLocation.p !== itemStr) {
          selectedLocation.d = "";
          selectedLocation.w = "";
        }
        selectedLocation.p = itemStr;
        switchLocTab("district");
        const pData = addressData.find((p) => p.name === selectedLocation.p);
        renderLocList(pData ? pData.districts.map((d) => d.name) : [], "d");
      } else if (type === "d") {
        if (selectedLocation.d !== itemStr) {
          selectedLocation.w = "";
        }
        selectedLocation.d = itemStr;
        switchLocTab("ward");
        const pData = addressData.find((p) => p.name === selectedLocation.p);
        const dData = pData
          ? pData.districts.find((d) => d.name === selectedLocation.d)
          : null;
        renderLocList(dData ? dData.wards.map((w) => w.name) : [], "w");
      } else {
        selectedLocation.w = itemStr;
        document.getElementById("loc-selected-text").innerText =
          `${selectedLocation.p}, ${selectedLocation.d}, ${selectedLocation.w}`;
        document.getElementById("loc-selected-text").style.color = "#333";
        document.getElementById("loc-dropdown").style.display = "none";
      }
    };
    listDiv.appendChild(div);
  });
}

// --- LOGIC DOANH THU & ĐƠN HÀNG (PIE CHART) ---
let revenueData = {
  fashion: 0,
  tech: 0,
  other: 0,
};
let totalRevAmount = 0;
let orderCount = 0;

const productTypes = [
  { name: "Áo Thun Nam", type: "fashion", price: 150000 },
  { name: "Tai nghe Bluetooth", type: "tech", price: 350000 },
  { name: "Sạc dự phòng", type: "tech", price: 200000 },
  { name: "Váy hoa nhí", type: "fashion", price: 180000 },
  { name: "Sách kỹ năng", type: "other", price: 90000 },
  { name: "Mỹ phẩm Dưỡng da", type: "other", price: 250000 },
];

function generateRandomOrder() {
  let container = document.getElementById("order-list-container");
  if (
    orderCount === 0 &&
    document.querySelectorAll(".order-item").length === 0
  ) {
    container.innerHTML = "";
  }

  let randomProd =
    productTypes[Math.floor(Math.random() * productTypes.length)];
  let orderId = "DH" + Math.floor(Math.random() * 90000 + 10000);

  let div = document.createElement("div");
  div.className = "order-item";
  div.innerHTML = `
            <div class="order-info">
                <strong style="color:#ee4d2d">${orderId}</strong>
                <span>Sản phẩm: ${randomProd.name}</span>
                <span style="color:#666; font-size:13px;">Giá: ${new Intl.NumberFormat("vi-VN").format(randomProd.price)} ₫</span>
            </div>
            <button class="btn-success" onclick="processOrder(this, '${randomProd.type}', ${randomProd.price})">Xác nhận & Hoàn tất</button>
        `;
  container.prepend(div);
}

function processOrder(btn, type, price) {
  // Xóa element đơn hàng
  let item = btn.parentElement;
  item.remove();

  // Hiển thị lại empty text nếu hết
  let container = document.getElementById("order-list-container");
  if (container.children.length === 0) {
    container.innerHTML =
      '<div style="text-align:center; color:#999; padding:20px;">Chưa có đơn hàng nào chờ xử lý</div>';
  }

  // Cập nhật doanh thu
  revenueData[type] += price;
  totalRevAmount += price;
  orderCount++;

  let revTextEl = document.getElementById("revenue-text");
  let totalOrdEl = document.getElementById("total-orders");
  if (revTextEl)
    revTextEl.innerText = new Intl.NumberFormat("vi-VN").format(totalRevAmount);
  if (totalOrdEl) totalOrdEl.innerText = orderCount;

  updatePieChart();
}

function updatePieChart() {
  let pieChartEl = document.getElementById("myPieChart");
  if (!pieChartEl) return;

  if (totalRevAmount === 0) {
    pieChartEl.style.backgroundImage = `conic-gradient(#f0f0f0 100%, transparent 0)`;
    return;
  }

  let pctFashion = (revenueData.fashion / totalRevAmount) * 100;
  let pctTech = (revenueData.tech / totalRevAmount) * 100;
  let pctOther = (revenueData.other / totalRevAmount) * 100;

  let lblFashion = document.getElementById("pct-fashion");
  let lblTech = document.getElementById("pct-tech");
  let lblOther = document.getElementById("pct-other");

  if (lblFashion) lblFashion.innerText = pctFashion.toFixed(1);
  if (lblTech) lblTech.innerText = pctTech.toFixed(1);
  if (lblOther) lblOther.innerText = pctOther.toFixed(1);

  // Vẽ biểu đồ conic-gradient: Cam(Fashion) -> Vàng(Tech) -> Xanh(Other)
  let p1 = pctFashion;
  let p2 = p1 + pctTech;

  let gradientStr = `conic-gradient(
            #ee4d2d 0% ${p1}%,
            #ffb74d ${p1}% ${p2}%,
            #2e7d32 ${p2}% 100%
        )`;

  pieChartEl.style.backgroundImage = gradientStr;
}
