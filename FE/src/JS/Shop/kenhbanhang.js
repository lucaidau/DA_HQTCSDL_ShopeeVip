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
  let transactions = [];
  let currentTab = "all";
  let searchQuery = "";
  let currentBalanceNum = 0;

  function formatCurrency(number) {
    return new Intl.NumberFormat("vi-VN").format(number) + " ₫";
  }

  App.loadWalletData = async function (params) {
    try {
      const res = await fetch(`http://localhost:3000/shop/vi/${shopID}`);
      const data = await res.json();
      console.log(`Thông tin ví của shop ${shopID}: `, data);
      if (res.ok && data.success) {
        const balanceEl = document.getElementById("currentBalance");
        if (balanceEl) {
          balanceEl.innerText = `${data.balance.toLocaleString("vi-VN")}đ`;
        }
        transactions = data.transactions || [];

        calculateBalance();
        renderTransactions();
      }
    } catch (error) {
      console.log("Lỗi kết nối API ví: ", error);
    }
  };

  function calculateBalance() {
    let totalIn = 0,
      totalOut = 0;
    transactions.forEach((t) => {
      if (t.LoaiGiaoDich == 1) totalIn += parseFloat(t.SoTien);
      else if (t.LoaiGiaoDich == 0) totalOut += parseFloat(t.SoTien);
    });
    currentBalanceNum = totalIn - totalOut;
    document.getElementById("currentBalance").innerText =
      formatCurrency(currentBalanceNum);

    document.getElementById("availableToWithdraw").innerText =
      formatCurrency(currentBalanceNum);
  }

  function renderTransactions() {
    try {
      const tbody = document.getElementById("transactionList");
      const noDataMsg = document.getElementById("noDataMessage");

      const filtered = transactions.filter((t) => {
        const matchTab =
          currentTab === "all" ||
          (currentTab === "in" && t.LoaiGiaoDich == 1) ||
          (currentTab === "out" && t.LoaiGiaoDich == 0);

        const searchQueryLower = searchQuery.toLowerCase();
        const matchSearch =
          !searchQuery ||
          String(t.IDGiaoDichFormat)
            .toLocaleLowerCase()
            .includes(searchQueryLower) ||
          String(t.NoiDung).toLocaleLowerCase().includes(searchQueryLower);
        return matchTab && matchSearch;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = "";
        noDataMsg.style.display = "block";
        noDataMsg.innerText = "Không tìm thấy giao dịch nào";
      } else {
        noDataMsg.style.display = "none";
        tbody.innerHTML = filtered
          .map((t) => {
            const sign = t.LoaiGiaoDich == 1 ? "+" : "-";
            return `
          <tr>
            <td style="color:#666;">${t.NgayThucHien}</td>
            <td style="font-weight: 500;">${t.IDGiaoDichFormat}</td>
            <td>${t.NoiDung}</td>
            <td class="${t.LoaiGiaoDich == 1 ? "amount-in" : "amount-out"}">${sign}${formatCurrency(parseFloat(t.SoTien))}</td>
            <td><a class="action-link" onclick="App.viewDetailSoDu('${t.IDGiaoDich}')">Xem</a></td>
          </tr>`;
          })
          .join("");
      }
    } catch (error) {
      console.log("Lỗi: ", error.message);
    }
  }

  // Public functions gắn vào window để onclick trong HTML gọi được
  App.viewDetailSoDu = function (id) {
    const t = transactions.find(
      (x) =>
        String(x.IDGiaoDich) === String(id) ||
        String(x.IDGiaoDichFormat) === String(id),
    );
    if (!t) {
      alert(`Không tìm thấy giao dịch với mã ${id}`);
      return;
    }
    document.getElementById("modalBodySoDu").innerHTML = `
      <p><strong>Mã GD:</strong> ${t.IDGiaoDichFormat}</p><p><strong>Loại:</strong> ${t.LoaiGiaoDich == 1 ? "Tiền vào" : "Tiền ra"}</p>
      <p><strong>Thời gian:</strong> ${t.NgayThucHien}</p><p><strong>Nội dung:</strong> ${t.NoiDung}</p>
      <hr style="margin: 15px 0; border:0; border-top: 1px dashed #ccc;">
      <div style="display:flex; justify-content:space-between; font-weight: bold;">
        <span>Số tiền:</span><span style="color: ${t.LoaiGiaoDich == 1 ? "#4caf50" : "#f44336"}">${t.LoaiGiaoDich == 1 ? "+" : "-"}${formatCurrency(parseFloat(t.SoTien))}</span>
      </div>`;
    document.getElementById("infoModalSoDu").classList.add("show");
  };

  App.openWithdrawModal = () => {
    if (currentBalanceNum <= 0) return alert("Số dư không đủ.");
    document.getElementById("withdrawAmount").value = "";
    document.getElementById("withdrawModal").classList.add("show");
  };
  App.closeWithdrawModal = () =>
    document.getElementById("withdrawModal").classList.remove("show");

  App.processWithdraw = async () => {
    const amount = parseInt(
      document.getElementById("withdrawAmount").value,
      10,
    );
    if (!amount || amount <= 0) return alert("Nhập số tiền hợp lệ!");
    if (amount > currentBalanceNum) return alert("Vượt quá số dư!");

    try {
      const payLoad = {
        shopID: parseInt(shopID),
        amount: parseFloat(amount),
        desc: "Rút tiền về tài khoản",
      };

      const res = await fetch("http://localhost:3000/shop/vi/rutien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payLoad),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "Rút tiền thành công");
        App.closeWithdrawModal();

        document
          .querySelectorAll(".filter-tab .tab-item")
          .forEach((t) => t.classList.remove("active"));
        const outTab = document.querySelector('.filter-tab [data-type="out"]');
        if (outTab) outTab.classList.add("active");
        currentTab = "out";

        App.loadWalletData();
      } else {
        alert("Rút tiền thất bại: " + (data.message || "Lỗi hệ thống"));
      }
    } catch (error) {
      console.error("Lỗi API rút tiền: ", error.message);
      alert("Lỗi kết nối API");
    }
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

  App.loadWalletData();
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
(function (App) {
  /**
   * HÀM SINH CÁC Ô NHẬP LIỆU GIÁ/KHO CHO TỪNG BIẾN THỂ TRÊN GIAO DIỆN
   */
  App.generateVariantTable = function () {
    const groupTitleInput = document.getElementById("variantGroupTitle");

    const valuesInput = document.getElementById("variantValuesInput");

    const tbody = document.getElementById("variantTableBody");

    const wrapper = document.getElementById("variantTableWrapper");

    if (!groupTitleInput || !valuesInput) {
      alert("Không tìm thấy thẻ");
      return;
    }

    const groupTitle = groupTitleInput.value.trim();
    const itemValue = valuesInput.value.trim();

    if (!groupTitle || !itemValue) {
      alert("Vui lòng nhập đầy đủ dữ liệu!");
      return;
    }

    let newRowHtml = "";

    const fullVariantName = `${groupTitle} - ${itemValue}`;

    newRowHtml += `
      <tr class="variant-row-item">
        <td style="padding: 10px; font-weight: 500; color: #333;">
          <input type="text" class="variant-name" value="${fullVariantName}" readonly style="width: 100%; padding: 8px; border: 1px solid #eee; background: #f9f9f9; border-radius: 10px; color: #ff4d4f; font-weight: 600" required />
        </td>
        <td style="padding: 10px;">
          <input type="number" class="variant-price" placeholder="Giá bán riêng (đ)" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required min="0" />
        </td>
        <td style="padding: 10px;">
          <input type="number" class="variant-stock" placeholder="Kho hàng riêng" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required min="0" />
        </td>
        <td style="padding: 10px;">
          <input type="text" class="variant-image" placeholder="Link hình ảnh (Nếu có)" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
        </td>
        <td style="padding: 10px; text-align: center;">
          <button type="button" class="btn" style="background: #ff4d4f; color: white; border: none; padding: 6px 12px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: bold;" onclick="App.removeVariantRow(this)">Xóa</button>
        </td>
      </tr>
    `;

    tbody.insertAdjacentHTML("beforeend", newRowHtml);
    groupTitleInput.value = "";
    valuesInput.value = "";
    valuesInput.focus();
    // Hiển thị khung chứa bảng
    wrapper.style.display = "block";
  };

  App.removeVariantRow = function (button) {
    const row = button.closest("tr");
    if (row) {
      row.remove();
    }
  };

  App.savedProducts = async function () {
    const procName = document.getElementById("productName").value;
    const procImgLink = document.getElementById("productImg").value;
    const procDesc = document.getElementById("description").value;

    const variantList = [];

    document
      .querySelectorAll("#variantTableBody .variant-row-item")
      .forEach((row) => {
        const quantity = row.querySelector(".variant-stock").value;
        const price = row.querySelector(".variant-price").value;
        const name = row.querySelector(".variant-name").value;
        const img = row.querySelector(".variant-image").value;
        const status = 1;

        variantList.push({
          SoLuongTonKho: parseInt(quantity),
          GiaBan: parseFloat(price) || 0,
          BienThe: name,
          HinhAnh: img || "",
          TrangThaiBS: parseInt(status),
        });
      });
    const newProc = {
      shopID: shopID,
      productName: procName,
      imgLink: procImgLink,
      desc: procDesc,
      copyList: variantList,
    };

    try {
      const res = await fetch(`http://localhost:3000/shop/themsp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProc),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Đã lưu sản phẩm!!");
        document.getElementById("variantTableBody").innerHTML = "";
        showTab("tatcasp-page");
      } else {
        alert("Thêm sản phẩm thất bại: " + (data.message || "Lỗi hệ thống"));
      }
    } catch (error) {
      console.log("Lỗi kết nối API: ", error);
      alert("Mất kết nối máy chủ");
    }
  };
})(window.App);

// ==================== MODULE: QUẢN LÝ ĐƠN HÀNG ====================
(function (App) {
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
        await App.loadWalletData();
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
