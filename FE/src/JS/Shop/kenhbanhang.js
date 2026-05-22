window.App = {};
// ==================== HỆ THỐNG ĐIỀU HƯỚNG SPA ====================
function showTab(pageId, navElement) {
  // Ẩn tất cả section
  document
    .querySelectorAll(".page-section")
    .forEach((el) => el.classList.remove("active"));
  // Hiện section được chọn
  document.getElementById(pageId).classList.add("active");

  // Đổi trạng thái active cho Sidebar
  if (navElement) {
    document
      .querySelectorAll(".nav-link")
      .forEach((el) => el.classList.remove("active"));
    navElement.classList.add("active");
  }

  // Reload data nếu chuyển sang tab Tất Cả Sản Phẩm
  if (pageId === "tatcasp-page" && window.App && window.App.reloadProducts) {
    window.App.reloadProducts();
  }
}

const userRaw = localStorage.getItem("user");
const shopID = JSON.parse(userRaw).IDShop;
const shopName = JSON.parse(userRaw).Ten;
document.querySelector(".user-name").innerText = shopName;

// Đối tượng trung gian để các module giao tiếp

// ==================== MODULE: SỐ DƯ TÀI KHOẢN ====================
(function (App) {
  let transactions = [
    {
      id: "IN-240415AABB",
      date: "15-04-2026 14:30",
      type: "in",
      desc: "Doanh thu đơn hàng 1",
      amount: 200,
    },
    {
      id: "OUT-WITHDRAW1",
      date: "12-04-2026 08:00",
      type: "out",
      desc: "Rút tiền về VCB",
      amount: 100,
    },
  ];
  let currentTab = "all";
  let searchQuery = "";
  let currentBalanceNum = 0;

  function formatCurrency(number) {
    return new Intl.NumberFormat("vi-VN").format(number) + " ₫";
  }

  function calculateBalance() {
    let totalIn = 0,
      totalOut = 0;
    transactions.forEach((t) => {
      if (t.type === "in") totalIn += t.amount;
      else if (t.type === "out") totalOut += t.amount;
    });
    currentBalanceNum = totalIn - totalOut;
    document.getElementById("currentBalance").innerText =
      formatCurrency(currentBalanceNum);
    document.getElementById("availableToWithdraw").innerText =
      formatCurrency(currentBalanceNum);
  }

  function renderTransactions() {
    const tbody = document.getElementById("transactionList");
    const noDataMsg = document.getElementById("noDataMessage");

    const filtered = transactions.filter((t) => {
      const matchTab = currentTab === "all" || t.type === currentTab;
      const matchSearch =
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = "";
      noDataMsg.style.display = "block";
    } else {
      noDataMsg.style.display = "none";
      tbody.innerHTML = filtered
        .map((t) => {
          const sign = t.type === "in" ? "+" : "-";
          return `
          <tr>
            <td style="color:#666;">${t.date}</td>
            <td style="font-weight: 500;">${t.id}</td>
            <td>${t.desc}</td>
            <td class="${t.type === "in" ? "amount-in" : "amount-out"}">${sign}${formatCurrency(t.amount)}</td>
            <td><a class="action-link" onclick="viewDetailSoDu('${t.id}')">Xem</a></td>
          </tr>`;
        })
        .join("");
    }
  }

  // Public functions gắn vào window để onclick trong HTML gọi được
  window.viewDetailSoDu = function (id) {
    const t = transactions.find((x) => x.id === id);
    if (!t) return;
    document.getElementById("modalBodySoDu").innerHTML = `
      <p><strong>Mã GD:</strong> ${t.id}</p><p><strong>Loại:</strong> ${t.type === "in" ? "Tiền vào" : "Tiền ra"}</p>
      <p><strong>Thời gian:</strong> ${t.date}</p><p><strong>Nội dung:</strong> ${t.desc}</p>
      <hr style="margin: 15px 0; border:0; border-top: 1px dashed #ccc;">
      <div style="display:flex; justify-content:space-between; font-weight: bold;">
        <span>Số tiền:</span><span style="color: ${t.type === "in" ? "#4caf50" : "#f44336"}">${t.type === "in" ? "+" : "-"}${formatCurrency(t.amount)}</span>
      </div>`;
    document.getElementById("infoModalSoDu").classList.add("show");
  };

  window.openWithdrawModal = () => {
    if (currentBalanceNum <= 0) return alert("Số dư không đủ.");
    document.getElementById("withdrawAmount").value = "";
    document.getElementById("withdrawModal").classList.add("show");
  };
  window.closeWithdrawModal = () =>
    document.getElementById("withdrawModal").classList.remove("show");

  window.processWithdraw = () => {
    const amount = parseInt(
      document.getElementById("withdrawAmount").value,
      10,
    );
    if (!amount || amount <= 0) return alert("Nhập số tiền hợp lệ!");
    if (amount > currentBalanceNum) return alert("Vượt quá số dư!");

    transactions.unshift({
      id: "OUT-REQ" + Math.floor(Math.random() * 9999),
      date: "Vừa xong",
      type: "out",
      desc: "Rút tiền về Vietcombank",
      amount,
      status: "success",
      statusText: "Thành công",
    });
    closeWithdrawModal();
    alert("Rút tiền thành công!");

    document
      .querySelectorAll("#sodu-tabs .tab-item")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelector('#sodu-tabs [data-type="out"]')
      .classList.add("active");
    currentTab = "out";
    calculateBalance();
    renderTransactions();
  };

  // Event Listeners riêng cho Module Số Dư
  document.querySelectorAll("#sodu-tabs .tab-item").forEach((tab) => {
    tab.addEventListener("click", function () {
      document
        .querySelectorAll("#sodu-tabs .tab-item")
        .forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      currentTab = this.getAttribute("data-type");
      renderTransactions();
    });
  });
  document.getElementById("searchInputSoDu").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderTransactions();
  });
  document.getElementById("searchBtnSoDu").addEventListener("click", () => {
    searchQuery = document.getElementById("searchInputSoDu").value;
    renderTransactions();
  });

  calculateBalance();
  renderTransactions();
})(window.App);

// ==================== MODULE: TẤT CẢ SẢN PHẨM ====================
(function (App) {
  let products = [];

  async function loadProducts() {
    try {
      const tableBody = document.getElementById("productTableBody");
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Đang tải danh sách sản phẩm từ hệ thống...</td></tr>`;
      }

      const res = await fetch(`http://localhost:3000/shop/${shopID}`);
      const data = await res.json();
      console.log("Sản phẩm của shop: ", data);

      if (res.ok && data.success) {
        products = data.shopProduct;
      } else {
        products = [];
        console.log("Backend trả về lỗi: ", data.message);
      }
    } catch (error) {
      console.error("Lỗi kết nối API: ", error);
      products = [];
    }
    filterProducts(true);
  }

  function formatPrice(v) {
    return new Intl.NumberFormat("vi-VN").format(v) + "đ";
  }

  function filterProducts(resetPage = false) {
    if (resetPage) currentPage = 1;
    const searchInput = document.getElementById("searchInputTatCa");
    const search = searchInput ? searchInput.value.trim().toLowerCase() : "";

    const categorySelect = document.getElementById("categorySelect");
    const category = categorySelect ? categorySelect.value : "";

    const statusSelect = document.getElementById("statusSelect");
    const status = statusSelect ? statusSelect.value : "";

    const filtered = products.filter((p) => {
      const matchSearch = p.TenSanPham
        ? p.TenSanPham.toLowerCase().includes(search)
        : true;

      const matchStatus = status !== "" ? p.TrangThaiBS == status : true;

      return matchSearch && matchStatus;
    });

    const tableBody = document.getElementById("productTableBody");
    if (!tableBody) return;

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888;">Không tìm thấy sản phẩm nào!</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered
      .map((p, index) => {
        const imgSrc = p.HinhAnh;
        const productName = p.TenSanPham + " " + p.BienThe;
        const currPrice = p.GiaBan;
        const currStock = p.SoLuongTonKho;
        const currStatus = p.TrangThaiBS == 1 ? "Đang bán" : "Hết hàng";
        return `
          <tr>
            <td><input type="checkbox" data-id="${p.IDSanPham}" /></td>
            <td><img src="${imgSrc}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;" /></td>
            <td>
              <div class="product-info">
                <div class="product-name" style="font-weight:600; color:#222;">${productName}</div>
                
              </div>
            </td>
            <td style="color:#ee4d2d; font-weight:500;">${formatPrice(currPrice)}</td>
            <td>${currStock}</td>
            <td><span class="status-pill ${p.TrangThaiBS == 1 ? "status-sell" : "status-out"}">${currStatus}</span></td>
            
          </tr>
        `;
      })
      .join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    document
      .getElementById("searchInputTatCa")
      .addEventListener("input", () => filterProducts(true));
    document
      .getElementById("statusSelect")
      .addEventListener("change", () => filterProducts(true));
  });

  // Public func để load lại khi thêm mới
  App.reloadProducts = loadProducts;
  loadProducts();
})(window.App);

// ==================== MODULE: THÊM SẢN PHẨM ====================
(function () {
  let selectedImageData = null;

  // Xử lý sự kiện tải hình ảnh sản phẩm gốc
  document.querySelectorAll(".file-input").forEach((input) => {
    input.addEventListener("change", () => {
      const box = input.closest(".upload-box");
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        selectedImageData = reader.result;
        box.style.backgroundImage = `url('${selectedImageData}')`;
        box.style.backgroundSize = "cover";
        box.querySelector(".upload-icon").style.display = "none";
        box.querySelector(".upload-text").textContent = "Đã chọn";
      };
      reader.readAsDataURL(file);
    });
  });

  /**
   * HÀM SINH CÁC Ô NHẬP LIỆU GIÁ/KHO CHO TỪNG BIẾN THỂ TRÊN GIAO DIỆN
   */
  window.generateVariantTable = function () {
    const groupTitle = document
      .getElementById("variantGroupTitle")
      .value.trim();
    const valuesRaw = document
      .getElementById("variantValuesInput")
      .value.trim();
    const tbody = document.getElementById("variantTableBody");
    const wrapper = document.getElementById("variantTableWrapper");

    if (!groupTitle || !valuesRaw) {
      alert("Vui lòng điền Tên thuộc tính và các Giá trị phân loại trước!");
      return;
    }

    // Tách mảng giá trị phân loại (Ví dụ: S, M, L)
    const listValues = valuesRaw
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    if (listValues.length === 0) return;

    // Tiến hành render các hàng nhập liệu <tr> có kèm ô input nhìn thấy được rõ ràng
    let htmlContent = "";
    listValues.forEach((value) => {
      const fullVariantName = `${groupTitle}: ${value}`;
      htmlContent += `
        <tr class="variant-row" data-name="${fullVariantName}">
          <td style="font-weight: 600; color: #ff5722; padding: 12px 15px;">${fullVariantName}</td>
          <td style="padding: 8px 10px;">
            <input type="number" class="variant-price" placeholder="Nhập giá tiền... đ" min="0" 
                   style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #ccd0d5; border-radius: 6px; box-sizing: border-box; display: block;" />
          </td>
          <td style="padding: 8px 10px;">
            <input type="number" class="variant-stock" placeholder="Số lượng kho..." min="0" 
                   style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #ccd0d5; border-radius: 6px; box-sizing: border-box; display: block;" />
          </td>
          <td style="padding: 8px 10px;">
            <input type="text" class="variant-img" placeholder="URL hình ảnh sản phẩm..." 
                   style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #ccd0d5; border-radius: 6px; box-sizing: border-box; display: block;" />
          </td>
        </tr>
      `;
    });

    // Gán dữ liệu vào tbody
    tbody.innerHTML = htmlContent;

    // Hiển thị khung chứa bảng
    wrapper.style.display = "block";
  };

  // Logic nút lưu sản phẩm thu thập giá riêng biệt
  document.getElementById("saveBtn").addEventListener("click", () => {
    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("categoryInput").value;

    if (!name || !category) {
      alert("Vui lòng điền đủ Tên và Ngành hàng!");
      return;
    }

    const rowElements = document.querySelectorAll(
      "#variantTableBody .variant-row",
    );
    if (rowElements.length === 0) {
      alert("Vui lòng cấu hình thuộc tính phân loại và nhấn Áp dụng!");
      return;
    }

    const listBanSao = [];
    let isDataValid = true;
    let priceMin = Infinity;
    let priceMax = -Infinity;
    let totalStock = 0;

    rowElements.forEach((row) => {
      const nameVariant = row.getAttribute("data-name");
      const priceVal = parseFloat(row.querySelector(".variant-price").value);
      const stockVal = parseInt(row.querySelector(".variant-stock").value, 10);
      const imgVal = row.querySelector(".variant-img").value.trim();

      if (isNaN(priceVal) || isNaN(stockVal) || priceVal < 0 || stockVal < 0) {
        isDataValid = false;
        return;
      }

      if (priceVal < priceMin) priceMin = priceVal;
      if (priceVal > priceMax) priceMax = priceVal;
      totalStock += stockVal;

      listBanSao.push({
        BienThe: nameVariant,
        GiaBan: priceVal,
        SoLuongTonKho: stockVal,
        HinhAnh: imgVal || selectedImageData || "https://picsum.photos/80/80",
      });
    });

    if (!isDataValid) {
      alert(
        "Vui lòng nhập đầy đủ Giá và Số lượng kho hợp lệ cho từng hàng biến thể!",
      );
      return;
    }

    // Đồ án: Đây là object Payload chứa mảng biến thể với các giá tiền khác nhau để gửi lên API Node.js
    const productPayload = {
      TenSanPham: name,
      IDDanhMuc: category,
      HinhAnh: selectedImageData || "https://picsum.photos/80/80",
      BanSaoSanPham: listBanSao,
    };

    // Đồng bộ lưu trữ tạm thời ra danh sách trang ngoài
    const savedProducts = JSON.parse(
      localStorage.getItem("tatcasanpham_extra_products") || "[]",
    );
    let displayPriceText = priceMin;
    if (priceMin !== priceMax) {
      displayPriceText = `${priceMin} - ${priceMax}`;
    }

    const newDisplayItem = {
      id: Date.now(),
      name: name,
      price: displayPriceText,
      stock: totalStock,
      status: "Đang bán",
      category: category,
      image: productPayload.HinhAnh,
    };

    savedProducts.unshift(newDisplayItem);
    localStorage.setItem(
      "tatcasanpham_extra_products",
      JSON.stringify(savedProducts),
    );

    alert(
      `Thành công! Đã thêm sản phẩm gốc kèm theo ${listBanSao.length} biến thể có giá tiền khác nhau.`,
    );
    document.getElementById("productForm").reset();
    tbody.innerHTML = "";
    wrapper.style.display = "none";
    showTab("tatcasp-page", document.querySelectorAll(".nav-link")[1]);
  });
})();

// ==================== MODULE: QUẢN LÝ ĐƠN HÀNG ====================
(function (App) {
  // Dữ liệu giả lập các đơn hàng của khách hàng
  let shippingOrders = [];

  let searchShipQuery = "";

  async function loadOrders() {
    try {
      const res = await fetch(`http://localhost:3000/shop/donhang/${shopID}`);
      const data = await res.json();

      if (res.ok && data.success) {
        shippingOrders = data.orders;
      } else {
        shippingOrders = [];
      }
      console.log("Đơn hàng của shop: ", data);
      console.log("Đơn hàng lấy được: ", shippingOrders);
    } catch (error) {
      console.error("Lỗi kết nối API đơn hàng: ", error);
      shippingOrders = [];
    }
    renderShippingOrders();
  }

  function formatVNCurrency(num) {
    return new Intl.NumberFormat("vi-VN").format(num) + "đ";
  }

  // Hàm hiển thị danh sách đơn hàng lên bảng
  function renderShippingOrders() {
    const tbody = document.getElementById("shippingOrderList");
    if (!tbody) return;

    const filtered = shippingOrders.filter((o) => {
      const matchBuyer = o.TenNguoiMua
        ? o.TenNguoiMua.toLowerCase().includes(searchShipQuery)
        : false;
      const matchProduct = o.IDDonHangFormat
        ? o.IDDonHangFormat.toLowerCase().includes(searchShipQuery)
        : false;
      return matchBuyer || matchProduct;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888; padding:30px;">Không tìm thấy đơn hàng nào.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered
      .map((o) => {
        const pillClass = o.TrangThai == 0 ? "status-out" : "status-sell";
        const statusText =
          o.TrangThai == 0 ? "Chờ xác nhận" : "Đang giao cho ĐVC";
        let actionBtn = "";
        if (o.TrangThai == 0) {
          actionBtn = `<button class="btn btn-primary" style="height:32px; padding:0 12px; font-size:12px;" onclick="shipOrder('${o.IDDonHang}')">Giao hàng</button>`;
        } else {
          actionBtn = `<span style="color:#4caf50; font-size:13px; font-weight:600;">✓ Đã bàn giao</span>`;
        }

        return `
        <tr>
          <td style="font-weight:600;">${o.IDDonHangFormat}<br><span style="font-size:11px; color:#999; font-weight:400;">${o.NgayTao}</span></td>
          <td><b>${o.TenNguoiMua}</b></td>
          <td>
            <div style="font-weight:500;">${o.TenSanPham + " " + o.TenBienThe}</div>
            <div style="font-size:12px; color:#777;">Số lượng: x${o.SoLuongMua}</div>
          </td>
          <td style="color:#ff5722; font-weight:600;">${formatVNCurrency(o.TongTien)}</td>
          <td>
            <span class="status-pill ${pillClass}">
              ${statusText}
            </span>
          </td>
          <td>${actionBtn}</td>
        </tr>
      `;
      })
      .join("");
  }

  // Hàm xử lý nút bấm giao hàng
  window.shipOrder = async function (id) {
    if (!confirm(`Xác nhận gói đơn hàng ${id} và chuyển cho đơn vị vận chuyển`))
      return;

    try {
      const res = await fetch(`http://localhost:3000/shop/donhang/xacnhan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: id }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Xác nhận chuẩn bị thành công");
        await loadOrders();
      } else {
        alert("Cập nhật thất bại: Lỗi hệ thống");
      }
    } catch (error) {
      console.error("Lỗi xác nhận đơn hàng: ", error);
      alert("Lỗi kết nối máy chủ");
    }
  };

  // Sự kiện lắng nghe bộ lọc Tìm Kiếm đơn hàng
  document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchOrderShip");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchShipQuery = e.target.value.toLowerCase();
        renderShippingOrders();
      });
    }

    const searchBtn = document.getElementById("btnSearchShip");
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        const input = document.getElementById("searchOrderShip");
        searchShipQuery = input ? input.value.toLowerCase() : "";
        renderShippingOrders();
      });
    }
  });

  // Khởi chạy render dữ liệu đơn hàng ngay khi module load
  App.loadOrders = loadOrders;
  loadOrders();
})(window.App);
