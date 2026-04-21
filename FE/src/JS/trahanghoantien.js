let returnOrders = [
  {
    id: "240418RET111",
    buyer: "ngoc_huyen_99",
    status: "pending",
    statusText: "CHƯA XỬ LÝ",
    statusColor: "#ff9800",
    reason: "Sản phẩm bị lỗi / Không hoạt động",
    product: { name: "Tai nghe Bluetooth không dây", variation: "Trắng", qty: 1, price: "450.000đ", img: "https://picsum.photos/100/100?random=20" },
    total: "450.000đ",
    btnText: "Xử lý ngay",
    btnClass: "btn-primary"
  },
  {
    id: "240417RET222",
    buyer: "hoang_tuan_anh",
    status: "refunded",
    statusText: "ĐÃ HOÀN TIỀN",
    statusColor: "#4caf50",
    reason: "Giao sai sản phẩm / Thiếu hàng",
    product: { name: "Áo thun tay ngắn Unisex", variation: "Màu: Đen, Size: XL", qty: 1, price: "150.000đ", img: "https://picsum.photos/100/100?random=21" },
    total: "150.000đ",
    btnText: "Xem chi tiết",
    btnClass: "btn-secondary"
  }
];

let currentTab = 'all';
let searchQuery = '';
let currentProcessingId = null;

function saveDashboardReturnStats() {
  const pending = returnOrders.filter(o => o.status === 'pending').length;
  const refunded = returnOrders.filter(o => o.status === 'refunded').length;
  const existing = JSON.parse(localStorage.getItem('dashboardOrderStats') || '{}');
  localStorage.setItem('dashboardOrderStats', JSON.stringify({
    ...existing,
    returnPending: pending,
    refunds: refunded,
  }));
}

function renderOrders() {
  const container = document.getElementById('orderListContainer');
  container.innerHTML = ''; 

  // Cập nhật số lượng trên tab "Chưa xử lý"
  const pendingCount = returnOrders.filter(o => o.status === 'pending').length;
  const badgeEl = document.getElementById('pendingCount');
  if(badgeEl) {
    badgeEl.innerText = pendingCount;
    badgeEl.style.display = pendingCount > 0 ? 'inline-block' : 'none';
  }

  saveDashboardReturnStats();

  const filtered = returnOrders.filter(order => {
    const matchTab = (currentTab === 'all') || (order.status === currentTab);
    const keyword = searchQuery.toLowerCase().trim();
    const matchSearch = order.id.toLowerCase().includes(keyword) || 
                        order.buyer.toLowerCase().includes(keyword) ||
                        order.product.name.toLowerCase().includes(keyword);
    return matchTab && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 50px; color: #888;">Không tìm thấy yêu cầu trả hàng/hoàn tiền nào.</div>`;
    return;
  }

  container.innerHTML = filtered.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div><span style="font-weight:600;">${order.buyer}</span> | Mã ĐH: ${order.id}</div>
        <div class="order-status" style="color: ${order.statusColor}">${order.statusText}</div>
      </div>
      <div class="order-body">
        <img src="${order.product.img}" class="product-img" />
        <div class="product-details">
          <div class="product-name">${order.product.name}</div>
          <div class="product-variation">${order.product.variation} x${order.product.qty}</div>
          <div class="reason-box">Lý do: ${order.reason}</div>
        </div>
        <div class="product-price">${order.product.price}</div>
      </div>
      <div class="order-footer">
        <div>Tổng số tiền: <strong>${order.total}</strong></div>
        <button class="btn ${order.btnClass}" onclick="openActionModal('${order.id}')">${order.btnText}</button>
      </div>
    </div>
  `).join('');
}

// MỞ POPUP XỬ LÝ
function openActionModal(orderId) {
  const order = returnOrders.find(o => o.id === orderId);
  if (!order) return;
  
  currentProcessingId = orderId;
  const btn = document.getElementById('confirmRefundBtn');

  if (order.status === 'pending') {
    document.getElementById('modalTitle').innerText = "Xử Lý Yêu Cầu Trả Hàng";
    document.getElementById('modalBody').innerHTML = `
      <p><strong>Người mua:</strong> ${order.buyer}</p>
      <p><strong>Lý do:</strong> ${order.reason}</p>
      <p><strong>Số tiền cần hoàn:</strong> <span style="color:#ff5722; font-weight:bold;">${order.total}</span></p>
      <p style="margin-top: 15px; color: #666; font-size: 13px;">Bằng việc bấm chấp nhận, hệ thống sẽ hoàn tiền cho người mua.</p>
    `;
    btn.style.display = 'inline-block';
  } else {
    document.getElementById('modalTitle').innerText = "Chi Tiết Yêu Cầu";
    document.getElementById('modalBody').innerHTML = `
      <p><strong>Trạng thái:</strong> ${order.statusText}</p>
      <p><strong>Lý do:</strong> ${order.reason}</p>
      <p><strong>Đã hoàn:</strong> <span style="color:#ff5722; font-weight:bold;">${order.total}</span></p>
    `;
    btn.style.display = 'none'; // Ẩn nút xử lý nếu đã xong
  }
  
  document.getElementById('infoModal').classList.add('show');
}

// XÁC NHẬN HOÀN TIỀN
function acceptRefund() {
  const orderIndex = returnOrders.findIndex(o => o.id === currentProcessingId);
  if (orderIndex > -1) {
    returnOrders[orderIndex].status = 'refunded';
    returnOrders[orderIndex].statusText = 'ĐÃ HOÀN TIỀN';
    returnOrders[orderIndex].statusColor = '#4caf50';
    returnOrders[orderIndex].btnText = 'Xem chi tiết';
    returnOrders[orderIndex].btnClass = 'btn-secondary';
    alert("Đã hoàn tiền thành công cho khách hàng!");
  }
  closeModal();
  renderOrders();
}

function closeModal() { document.getElementById('infoModal').classList.remove('show'); }

window.onclick = function(event) {
  const modal = document.getElementById('infoModal');
  if (event.target === modal) closeModal();
}

// CHUYỂN TAB & TÌM KIẾM
document.querySelectorAll('.tab-item').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    currentTab = this.getAttribute('data-type');
    renderOrders();
  });
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderOrders();
});

document.getElementById('searchBtn').addEventListener('click', function() {
  searchQuery = document.getElementById('searchInput').value;
  renderOrders();
});

document.addEventListener('DOMContentLoaded', renderOrders);