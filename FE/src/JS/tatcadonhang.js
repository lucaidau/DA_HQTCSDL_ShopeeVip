// 1. DỮ LIỆU ĐƠN HÀNG (Đã thêm thông tin Đánh giá và Lý do hủy)
let orders = [
  {
    id: "240415AABBCC1",
    buyer: "nguyenvana123",
    status: "pending",
    product: { name: "Áo thun tay ngắn Unisex chất cotton thoáng mát", variation: "Màu: Đen, Size: L", qty: 2, price: "150.000đ", img: "https://picsum.photos/100/100?random=1" },
    total: "300.000đ"
  },
  {
    id: "240414XYZ987",
    buyer: "lethib_hcm",
    status: "shipping",
    product: { name: "Tai nghe Bluetooth không dây chống ồn", variation: "Màu: Trắng", qty: 1, price: "450.000đ", img: "https://picsum.photos/100/100?random=2" },
    total: "450.000đ"
  },
  {
    id: "240412SHOPEE9",
    buyer: "tran_van_c",
    status: "completed",
    product: { name: "Balo Laptop đa năng chống nước", variation: "Màu: Xám", qty: 1, price: "299.000đ", img: "https://picsum.photos/100/100?random=3" },
    total: "299.000đ",
    // Dữ liệu đánh giá cho đơn đã giao
    review: { rating: 5, comment: "Sản phẩm chất lượng tuyệt vời, đường may chắc chắn. Giao hàng rất nhanh, shop đóng gói cẩn thận. Sẽ ủng hộ lần sau!" } 
  },
  {
    id: "240410CANCELD",
    buyer: "ttt_hoang", 
    status: "cancelled",
    product: { name: "Ốp lưng điện thoại Silicon", variation: "Dòng: iPhone 14 Pro Max", qty: 3, price: "50.000đ", img: "https://picsum.photos/100/100?random=4" },
    total: "150.000đ",
    // Dữ liệu lý do hủy
    cancelReason: "Người mua đổi ý không muốn mua nữa."
  }
];

const statusConfig = {
  'pending': { text: 'Chờ xác nhận', btnText: 'Chuẩn bị hàng', btnClass: 'btn-primary' },
  'shipping': { text: 'Chờ lấy hàng', btnText: 'In phiếu giao', btnClass: 'btn-secondary' },
  'delivering': { text: 'Đang giao', btnText: 'Xem tiến độ', btnClass: 'btn-secondary' },
  'completed': { text: 'Đã giao', btnText: 'Xem đánh giá', btnClass: 'btn-secondary' },
  'cancelled': { text: 'Đã hủy', btnText: 'Chi tiết hủy', btnClass: 'btn-secondary' }
};

let currentTab = 'all';
let searchQuery = '';

// --- CÁC HÀM XỬ LÝ CỬA SỔ POPUP (MODAL) ---
function showModal(title, content) {
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalBody').innerHTML = content;
  document.getElementById('infoModal').classList.add('show');
}

function closeModal() {
  document.getElementById('infoModal').classList.remove('show');
}

// Đóng popup khi click ra ngoài vùng đen
window.onclick = function(event) {
  const modal = document.getElementById('infoModal');
  if (event.target === modal) {
    closeModal();
  }
}
// ------------------------------------------

// 2. HÀM XỬ LÝ KHI BẤM NÚT (Hành động của từng loại đơn)
function actionOrder(orderId, buttonElement) {
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return;
  const order = orders[orderIndex];

  if (order.status === 'pending') {
    // XÁC NHẬN ĐƠN HÀNG
    orders[orderIndex].status = 'shipping';
    alert(`Đã xác nhận đơn hàng: ${orderId}\nĐơn hàng đã được chuyển sang "Chờ lấy hàng"!`);
    renderOrders(); 
  } 
  else if (order.status === 'shipping') {
    // IN PHIẾU GIAO
    const cardElement = buttonElement.closest('.order-card');
    cardElement.classList.add('print-target');
    window.print(); 
    cardElement.classList.remove('print-target');
  } 
  else if (order.status === 'completed') {
    // XEM ĐÁNH GIÁ (Hiển thị Popup)
    const stars = '★'.repeat(order.review.rating) + '☆'.repeat(5 - order.review.rating);
    const content = `
      <div class="star-rating">${stars}</div>
      <p><strong>Khách hàng:</strong> ${order.buyer}</p>
      <p><strong>Ngày đánh giá:</strong> 15-04-2026</p>
      <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin-top: 10px; font-style: italic;">
        "${order.review.comment}"
      </div>
    `;
    showModal("Chi Tiết Đánh Giá Của Khách Hàng", content);
  }
  else if (order.status === 'cancelled') {
    // XEM CHI TIẾT HỦY (Hiển thị Popup)
    const content = `
      <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
      <p><strong>Người mua:</strong> ${order.buyer}</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 12px 0;">
      <p><strong>Người hủy:</strong> Khách hàng</p>
      <p><strong>Lý do hủy:</strong> <span style="color: #f44336; font-weight: bold;">${order.cancelReason}</span></p>
    `;
    showModal("Chi Tiết Đơn Đã Hủy", content);
  }
  else {
    alert(`Chức năng [${statusConfig[order.status].btnText}] đang được phát triển!`);
  }
}

// 3. HÀM RENDER ĐƠN HÀNG RA MÀN HÌNH
function renderOrders() {
  const container = document.getElementById('orderListContainer');
  container.innerHTML = ''; 

  const filteredOrders = orders.filter(order => {
    const matchTab = (currentTab === 'all') || (order.status === currentTab);
    const keyword = searchQuery.toLowerCase().trim();
    const matchSearch = order.id.toLowerCase().includes(keyword) || 
                        order.buyer.toLowerCase().includes(keyword) ||
                        order.product.name.toLowerCase().includes(keyword);

    return matchTab && matchSearch;
  });

  saveDashboardOrderStats();

  if (filteredOrders.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 50px; color: #888;">Không tìm thấy đơn hàng nào khớp với từ khóa của bạn.</div>`;
    return;
  }

  const html = filteredOrders.map(order => {
    const config = statusConfig[order.status];
    return `
    <div class="order-card">
      <div class="order-header">
        <div><span class="buyer-info">${order.buyer}</span> | Mã ĐH: ${order.id}</div>
        <div class="order-status status-${order.status}">${config.text}</div>
      </div>
      <div class="order-body">
        <img src="${order.product.img}" alt="Ảnh sản phẩm" class="product-img" />
        <div class="product-details">
          <div class="product-name">${order.product.name}</div>
          <div class="product-variation">${order.product.variation}</div>
          <div class="product-qty">x${order.product.qty}</div>
        </div>
        <div class="product-price">${order.product.price}</div>
      </div>
      <div class="order-footer">
        <div></div> 
        <div style="display:flex; align-items: center; gap: 20px;">
          <div class="order-total">
            <span>Tổng số tiền:</span>
            <strong>${order.total}</strong>
          </div>
          <div class="order-actions">
            <button class="btn ${config.btnClass}" onclick="actionOrder('${order.id}', this)">${config.btnText}</button>
          </div>
        </div>
      </div>
    </div>
  `}).join('');

  container.innerHTML = html;
}

const saveDashboardOrderStats = () => {
  const pending = orders.filter(o => o.status === 'pending').length;
  const shipping = orders.filter(o => o.status === 'shipping').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const revenue = orders.reduce((sum, order) => {
    if (order.status === 'completed') {
      return sum + Number(order.total.replace(/\./g, '').replace('đ', '').trim());
    }
    return sum;
  }, 0);
  const totalOrders = orders.length;

  const existing = JSON.parse(localStorage.getItem('dashboardOrderStats') || '{}');
  localStorage.setItem('dashboardOrderStats', JSON.stringify({
    ...existing,
    pending,
    shipping,
    cancelled,
    completed,
    revenue,
    totalOrders,
  }));
};

// 4. GẮN SỰ KIỆN CHO CÁC TAB
document.querySelectorAll('.tab-item').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    currentTab = this.getAttribute('data-status');
    renderOrders(); 
  });
});

// 5. GẮN SỰ KIỆN TÌM KIẾM
document.getElementById('searchInput').addEventListener('input', function(e) {
  searchQuery = e.target.value;
  renderOrders();
});

document.getElementById('searchBtn').addEventListener('click', function() {
  searchQuery = document.getElementById('searchInput').value;
  renderOrders();
});

document.addEventListener('DOMContentLoaded', () => {
  renderOrders();
});