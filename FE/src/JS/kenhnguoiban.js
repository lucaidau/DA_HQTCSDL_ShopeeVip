// ==================== HỆ THỐNG ĐIỀU HƯỚNG SPA ====================
function showTab(pageId, navElement) {
  // Ẩn tất cả section
  document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
  // Hiện section được chọn
  document.getElementById(pageId).classList.add('active');
  
  // Đổi trạng thái active cho Sidebar
  if(navElement) {
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    navElement.classList.add('active');
  }

  // Reload data nếu chuyển sang tab Tất Cả Sản Phẩm
  if(pageId === 'tatcasp-page' && window.App && window.App.reloadProducts) {
    window.App.reloadProducts();
  }
}

// Đối tượng trung gian để các module giao tiếp
window.App = {};

// ==================== MODULE: SỐ DƯ TÀI KHOẢN ====================
(function() {
  let transactions = [
    { id: "IN-240415AABB", date: "15-04-2026 14:30", type: "in", desc: "Doanh thu đơn hàng 1", amount: 2000000, status: "success", statusText: "Thành công" },
    { id: "OUT-WITHDRAW1", date: "12-04-2026 08:00", type: "out", desc: "Rút tiền về VCB", amount: 1000000, status: "success", statusText: "Thành công" }
  ];
  let currentTab = 'all';
  let searchQuery = '';
  let currentBalanceNum = 0;

  function formatCurrency(number) { return new Intl.NumberFormat('vi-VN').format(number) + ' ₫'; }

  function calculateBalance() {
    let totalIn = 0, totalOut = 0;
    transactions.forEach(t => {
      if (t.type === 'in' && t.status === 'success') totalIn += t.amount;
      else if (t.type === 'out') totalOut += t.amount;
    });
    currentBalanceNum = totalIn - totalOut;
    document.getElementById('currentBalance').innerText = formatCurrency(currentBalanceNum);
    document.getElementById('availableToWithdraw').innerText = formatCurrency(currentBalanceNum);
  }

  function renderTransactions() {
    const tbody = document.getElementById('transactionList');
    const noDataMsg = document.getElementById('noDataMessage');
    
    const filtered = transactions.filter(t => {
      const matchTab = (currentTab === 'all') || (t.type === currentTab);
      const matchSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      noDataMsg.style.display = 'block';
    } else {
      noDataMsg.style.display = 'none';
      tbody.innerHTML = filtered.map(t => {
        const sign = t.type === 'in' ? '+' : '-';
        return `
          <tr>
            <td style="color:#666;">${t.date}</td>
            <td style="font-weight: 500;">${t.id}</td>
            <td>${t.desc}</td>
            <td class="${t.type === 'in' ? 'amount-in' : 'amount-out'}">${sign}${formatCurrency(t.amount)}</td>
            <td><span class="status-label ${t.status === 'success' ? 'status-success' : 'status-processing'}">${t.statusText}</span></td>
            <td><a class="action-link" onclick="viewDetailSoDu('${t.id}')">Xem</a></td>
          </tr>`;
      }).join('');
    }
  }

  // Public functions gắn vào window để onclick trong HTML gọi được
  window.viewDetailSoDu = function(id) {
    const t = transactions.find(x => x.id === id);
    if(!t) return;
    document.getElementById('modalBodySoDu').innerHTML = `
      <p><strong>Mã GD:</strong> ${t.id}</p><p><strong>Loại:</strong> ${t.type === 'in' ? 'Tiền vào' : 'Tiền ra'}</p>
      <p><strong>Thời gian:</strong> ${t.date}</p><p><strong>Nội dung:</strong> ${t.desc}</p>
      <hr style="margin: 15px 0; border:0; border-top: 1px dashed #ccc;">
      <div style="display:flex; justify-content:space-between; font-weight: bold;">
        <span>Số tiền:</span><span style="color: ${t.type === 'in' ? '#4caf50' : '#f44336'}">${t.type === 'in' ? '+' : '-'}${formatCurrency(t.amount)}</span>
      </div>`;
    document.getElementById('infoModalSoDu').classList.add('show');
  };

  window.openWithdrawModal = () => {
    if (currentBalanceNum <= 0) return alert("Số dư không đủ.");
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawModal').classList.add('show');
  };
  window.closeWithdrawModal = () => document.getElementById('withdrawModal').classList.remove('show');
  
  window.processWithdraw = () => {
    const amount = parseInt(document.getElementById('withdrawAmount').value, 10);
    if (!amount || amount <= 0) return alert("Nhập số tiền hợp lệ!");
    if (amount > currentBalanceNum) return alert("Vượt quá số dư!");
    
    transactions.unshift({ id: "OUT-REQ" + Math.floor(Math.random() * 9999), date: "Vừa xong", type: "out", desc: "Rút tiền về Vietcombank", amount, status: "success", statusText: "Thành công" });
    closeWithdrawModal(); alert("Rút tiền thành công!");
    
    document.querySelectorAll('#sodu-tabs .tab-item').forEach(t => t.classList.remove('active'));
    document.querySelector('#sodu-tabs [data-type="out"]').classList.add('active');
    currentTab = 'out';
    calculateBalance(); renderTransactions();
  };

  // Event Listeners riêng cho Module Số Dư
  document.querySelectorAll('#sodu-tabs .tab-item').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('#sodu-tabs .tab-item').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentTab = this.getAttribute('data-type');
      renderTransactions();
    });
  });
  document.getElementById('searchInputSoDu').addEventListener('input', e => { searchQuery = e.target.value; renderTransactions(); });
  document.getElementById('searchBtnSoDu').addEventListener('click', () => { searchQuery = document.getElementById('searchInputSoDu').value; renderTransactions(); });

  calculateBalance(); renderTransactions();
})();

// ==================== MODULE: TẤT CẢ SẢN PHẨM ====================
(function() {
  let products = [];
  const itemsPerPage = 6;
  let currentPage = 1;

  function generateProducts() {
    return Array.from({length: 12}, (_, i) => ({
      id: i + 1, image: `https://picsum.photos/seed/prod${i+1}/80/80`, name: `Sản phẩm mẫu ${i+1}`,
      sku: `SP00${i+1}`, price: Math.floor(Math.random() * 500000) + 50000, stock: Math.floor(Math.random() * 50),
      status: "Đang bán", category: "Thời trang"
    }));
  }

  function loadProducts() {
    products = generateProducts();
    const saved = JSON.parse(localStorage.getItem("tatcasanpham_extra_products") || "[]");
    products = [...saved, ...products];
    filterProducts(true);
  }

  function formatPrice(v) { return new Intl.NumberFormat("vi-VN").format(v) + "đ"; }

  function filterProducts(resetPage = false) {
    if (resetPage) currentPage = 1;
    const search = document.getElementById('searchInputTatCa').value.trim().toLowerCase();
    const category = document.getElementById('categorySelect').value;
    const status = document.getElementById('statusSelect').value;

    const filtered = products.filter(p => {
      return (p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search)) &&
             (category ? p.category === category : true) &&
             (status ? p.status === status : true);
    });

    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filtered.slice(start, start + itemsPerPage);
    
    document.getElementById("productTableBody").innerHTML = pageItems.map(p => `
      <tr>
        <td><input type="checkbox" /></td>
        <td><img src="${p.image}" /></td>
        <td><div class="product-info"><div><div class="product-name">${p.name}</div><div class="product-sku">${p.sku}</div></div></div></td>
        <td>${formatPrice(p.price)}</td><td>${p.stock}</td>
        <td><span class="status-pill status-sell">${p.status}</span></td>
        <td><div class="action-links"><button onclick="deleteProduct(${p.id})" class="delete">Xóa</button></div></td>
      </tr>
    `).join("");
  }

  window.deleteProduct = function(id) {
    if(!confirm("Xóa sản phẩm này?")) return;
    const idx = products.findIndex(p => p.id === id);
    if(idx > -1) products.splice(idx, 1);
    filterProducts();
  }

  document.getElementById('searchInputTatCa').addEventListener('input', () => filterProducts(true));
  document.getElementById('categorySelect').addEventListener('change', () => filterProducts(true));
  document.getElementById('statusSelect').addEventListener('change', () => filterProducts(true));
  
  // Public func để load lại khi thêm mới
  window.App.reloadProducts = loadProducts;
  loadProducts();
})();

// ==================== MODULE: THÊM SẢN PHẨM ====================
(function() {
  let selectedImageData = null;
  document.querySelectorAll(".file-input").forEach(input => {
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

  document.getElementById('saveBtn').addEventListener('click', () => {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('categoryInput').value;
    const price = Number(document.getElementById('priceInput').value);
    
    if (!name || !category) {
      alert("Vui lòng điền đủ Tên và Ngành hàng!"); return;
    }

    const newProduct = {
      id: Date.now(), name, sku: `SP${Date.now().toString().slice(-4)}`, price: price || 0,
      stock: Number(document.getElementById('stockInput').value) || 0,
      status: "Đang bán", category, image: selectedImageData || `https://picsum.photos/80/80?random=${Date.now()}`
    };

    const saved = JSON.parse(localStorage.getItem("tatcasanpham_extra_products") || "[]");
    saved.unshift(newProduct);
    localStorage.setItem("tatcasanpham_extra_products", JSON.stringify(saved));

    alert("Thêm thành công!");
    document.getElementById('productForm').reset();
    showTab('tatcasp-page', document.querySelectorAll('.nav-link')[1]);
  });
})();

// ==================== MODULE: TRẢ HÀNG HOÀN TIỀN ====================
(function() {
  let returnOrders = [
    { id: "240418RET1", buyer: "ngoc_huyen_99", status: "pending", statusText: "CHƯA XỬ LÝ", statusColor: "#ff9800", reason: "Sản phẩm lỗi", product: { name: "Tai nghe Bluetooth", variation: "Trắng", qty: 1, price: "450.000đ", img: "https://picsum.photos/80/80?random=20" }, total: "450.000đ" }
  ];
  let currentTab = 'all';
  let searchQuery = '';
  let currentProcessingId = null;

  function renderOrders() {
    const container = document.getElementById('orderListContainer');
    const pendingCount = returnOrders.filter(o => o.status === 'pending').length;
    document.getElementById('pendingCount').innerText = pendingCount;
    document.getElementById('pendingCount').style.display = pendingCount > 0 ? 'inline-block' : 'none';

    const filtered = returnOrders.filter(o => (currentTab === 'all' || o.status === currentTab) && (o.id.toLowerCase().includes(searchQuery) || o.buyer.toLowerCase().includes(searchQuery)));

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center; color:#888;">Không có dữ liệu.</div>`; return;
    }

    container.innerHTML = filtered.map(o => `
      <div class="order-card">
        <div class="order-header"><div><b>${o.buyer}</b> | Mã: ${o.id}</div><div style="color:${o.statusColor}; font-weight:bold;">${o.statusText}</div></div>
        <div class="order-body">
          <img src="${o.product.img}" class="product-img" />
          <div class="product-details"><div class="product-name">${o.product.name}</div><div class="reason-box">Lý do: ${o.reason}</div></div>
          <div style="font-weight:bold;">${o.product.price}</div>
        </div>
        <div class="order-footer">
          <div>Tổng tiền: <strong>${o.total}</strong></div>
          <button class="btn ${o.status === 'pending' ? 'btn-primary' : 'btn-secondary'}" onclick="openActionModal('${o.id}')">${o.status === 'pending' ? 'Xử lý ngay' : 'Xem chi tiết'}</button>
        </div>
      </div>
    `).join('');
  }

  window.openActionModal = function(id) {
    const order = returnOrders.find(o => o.id === id);
    currentProcessingId = id;
    const btn = document.getElementById('confirmRefundBtn');
    
    document.getElementById('modalTitleTraHang').innerText = order.status === 'pending' ? "Xử Lý Yêu Cầu" : "Chi Tiết Yêu Cầu";
    document.getElementById('modalBodyTraHang').innerHTML = `<p><strong>Người mua:</strong> ${order.buyer}</p><p><strong>Lý do:</strong> ${order.reason}</p><p><strong>Số tiền:</strong> <span style="color:#ff5722;font-weight:bold;">${order.total}</span></p>`;
    btn.style.display = order.status === 'pending' ? 'inline-block' : 'none';
    
    document.getElementById('infoModalTraHang').classList.add('show');
  }

  window.acceptRefund = function() {
    const order = returnOrders.find(o => o.id === currentProcessingId);
    if(order) { order.status = 'refunded'; order.statusText = 'ĐÃ HOÀN TIỀN'; order.statusColor = '#4caf50'; alert("Hoàn tiền thành công!"); }
    document.getElementById('infoModalTraHang').classList.remove('show');
    renderOrders();
  }

  document.querySelectorAll('#trahang-tabs .tab-item').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('#trahang-tabs .tab-item').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentTab = this.getAttribute('data-type'); renderOrders();
    });
  });
  document.getElementById('searchInputTraHang').addEventListener('input', e => { searchQuery = e.target.value.toLowerCase(); renderOrders(); });
  
  renderOrders();
})();