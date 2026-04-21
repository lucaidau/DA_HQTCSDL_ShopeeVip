const cancelledOrders = [
  {
    id: "240416BUYER12",
    buyer: "nguyen_van_a",
    cancelType: "buyer",
    cancelReason: "Thay đổi ý định, không muốn mua nữa.",
    product: { name: "Bàn phím cơ không dây Bluetooth", variation: "Switch Đỏ", qty: 1, price: "650.000đ", img: "https://picsum.photos/100/100?random=11" },
    total: "650.000đ"
  },
  {
    id: "240415SELLER9",
    buyer: "le_thi_b_hcm",
    cancelType: "seller",
    cancelReason: "Sản phẩm đã hết hàng trong kho.",
    product: { name: "Chuột Gaming LED RGB", variation: "Màu: Đen", qty: 2, price: "250.000đ", img: "https://picsum.photos/100/100?random=12" },
    total: "500.000đ"
  },
  {
    id: "240410SYSTEMX",
    buyer: "ttt_hoang",
    cancelType: "system",
    cancelReason: "Người mua chưa thanh toán đúng hạn.",
    product: { name: "Ốp lưng điện thoại Silicon", variation: "iPhone 14 Pro Max", qty: 3, price: "50.000đ", img: "https://picsum.photos/100/100?random=13" },
    total: "150.000đ"
  }
];

let currentTab = 'all';
let searchQuery = '';

function saveDashboardCancelStats() {
  const cancelled = cancelledOrders.length;
  const existing = JSON.parse(localStorage.getItem('dashboardOrderStats') || '{}');
  localStorage.setItem('dashboardOrderStats', JSON.stringify({
    ...existing,
    cancelled,
  }));
}

function renderOrders() {
  const container = document.getElementById('orderListContainer');
  container.innerHTML = ''; 

  const filtered = cancelledOrders.filter(order => {
    const matchTab = (currentTab === 'all') || (order.cancelType === currentTab);
    const keyword = searchQuery.toLowerCase().trim();
    const matchSearch = order.id.toLowerCase().includes(keyword) || 
                        order.buyer.toLowerCase().includes(keyword) ||
                        order.product.name.toLowerCase().includes(keyword);
    return matchTab && matchSearch;
  });

  saveDashboardCancelStats();

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 50px; color: #888;">Không tìm thấy đơn hủy nào.</div>`;
    return;
  }

  container.innerHTML = filtered.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div><span style="font-weight:600;">${order.buyer}</span> | Mã ĐH: ${order.id}</div>
        <div class="order-status">ĐÃ HỦY</div>
      </div>
      <div class="order-body">
        <img src="${order.product.img}" class="product-img" />
        <div class="product-details">
          <div class="product-name">${order.product.name}</div>
          <div class="product-variation">${order.product.variation} x${order.product.qty}</div>
        </div>
        <div class="product-price">${order.product.price}</div>
      </div>
      <div class="order-footer">
        <div>Tổng số tiền: <strong>${order.total}</strong></div>
        <button class="btn btn-secondary" onclick="viewCancelDetails('${order.id}')">Chi tiết hủy</button>
      </div>
    </div>
  `).join('');
}

function viewCancelDetails(orderId) {
  const order = cancelledOrders.find(o => o.id === orderId);
  if (!order) return;
  document.getElementById('modalBody').innerHTML = `
    <p><strong>Người mua:</strong> ${order.buyer}</p>
    <p><strong>Lý do hủy:</strong> <span style="color:red;">${order.cancelReason}</span></p>
  `;
  document.getElementById('infoModal').classList.add('show');
}

function closeModal() { document.getElementById('infoModal').classList.remove('show'); }

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

document.addEventListener('DOMContentLoaded', renderOrders);