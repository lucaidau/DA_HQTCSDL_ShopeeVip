let data = [];
let suggestionItems = [];
let loadCount = 0;

const getCurrentUser = () => JSON.parse(localStorage.getItem('user') || 'null');

const isSellerUser = (user) => {
  if (!user) return false;
  const role = String(user.role || '').trim().toLowerCase();
  return role === 'seller' || role === '2' || role.includes('bán');
};

const updateUserDisplay = () => {
  const user = getCurrentUser();
  if (!user) {
    window.location = 'index.html';
    return;
  }
  if (isSellerUser(user)) {
    window.location = 'kenhbanhang.html';
    return;
  }

  const displayName = user.name || user.username || user.userName || 'Username';
  const displayEl = document.getElementById('display-name');
  const avatarEl = document.querySelector('#user-display .user-avatar');

  if (displayEl) displayEl.innerText = displayName;
  if (avatarEl) {
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0].toUpperCase())
      .slice(0, 2)
      .join('');
    avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;
  }
};

const getProduct = async () => {
  try {
    const res = await fetch("http://localhost:3000/sanpham");
    const dt = await res.json();
    data = dt.danhSachSanPham[0] || [];
  } catch (error) {
    console.error("Lỗi lấy sản phẩm");
    data = [];
  }

  if (data.length > 0) {
    suggestionItems = data.slice(0, 16);
  } else {
    suggestionItems = buildSuggestionCards(16);
  }

  renderItem(suggestionItems);
  renderRandomImages();
};

const buildSuggestionCards = (count = 12) => {
  const titles = [
    'Miếng dán kim loại 3D',
    'Móc khóa Hello Kitty',
    'Kệ giày để đồ',
    'Combo 2 túi nước giặt',
    'Tai nghe Bluetooth TWS',
    'Sách Văn Phòng',
    'Bộ miếng hút bụi',
    'Cây lăn bụng quần áo',
    'Áo Polo Sweater',
    'Cọ silicon thoa son',
    'Lược chải tóc tạo kiểu',
    'Đèn bàn học nhỏ gọn',
    'Bình giữ nhiệt inox',
    'Túi xách thời trang',
    'Giày thể thao unisex',
    'Máy mát xa cầm tay',
    'Đèn bàn LED',
    'Bình giữ nhiệt cao cấp',
    'Túi xách mini',
    'Bàn làm việc gấp gọn'
  ];

  const startIndex = loadCount;
  const items = [];

  for (let i = 0; i < count; i++) {
    const idx = startIndex + i;
    items.push({
      id: `suggest-${idx + 1}`,
      TenSanPham: titles[idx % titles.length],
      HinhAnh: `https://picsum.photos/320/320?random=${50 + idx}`,
      Gia: ((Math.floor(Math.random() * 180) + 20) * 1000).toString(),
      sold: Math.floor(Math.random() * 500) + 1
    });
  }

  loadCount += count;
  return items;
};

const CART_COUNT_KEY = 'cartCount';
const CART_ITEMS_KEY = 'cartItems';
const grid = document.getElementById("productGrid");
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

const getCartItems = () => {
  const stored = localStorage.getItem(CART_ITEMS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Không thể đọc giỏ hàng', error);
    return [];
  }
};

const getCartCount = () => {
  const count = Number(localStorage.getItem(CART_COUNT_KEY) || 0);
  if (count > 0) return count;
  return getCartItems().reduce((sum, item) => sum + Number(item.quantity || item.SoLuongMua || 1), 0);
};

const setCartCount = (count) => localStorage.setItem(CART_COUNT_KEY, count);
const updateCartBadge = () => {
  const badge = document.querySelector('.cart-badge');
  if (!badge) return;
  const count = getCartCount();
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
};

const saveSelectedProduct = (item) => {
  try {
    localStorage.setItem('selectedProduct', JSON.stringify(item));
  } catch (error) {
    console.warn('Không thể lưu sản phẩm đã chọn', error);
  }
};

const renderItem = (items) => {
  if (!items || items.length === 0) {
    grid.innerHTML = `<div style="padding: 40px; color: #555; text-align: center;">Không tìm thấy sản phẩm nào.</div>`;
    return;
  }
  let html = items.map((item, index) => createProductHTML(item, index)).join("");
  grid.innerHTML = html;

  const cards = grid.querySelectorAll('.card.product-card');
  cards.forEach((card, index) => {
    card.addEventListener('click', () => saveSelectedProduct(items[index]));
  });
};

const searchProducts = () => {
  const keyword = searchInput.value.trim().toLowerCase();

  if (!keyword) {
    renderItem(suggestionItems);
    return;
  }

  const filtered = suggestionItems.filter((item) => {
    const productName = (item.TenSanPham || '').toLowerCase();
    return productName.includes(keyword);
  });

  if (!filtered.length) {
    grid.innerHTML = `<div style="padding: 40px; color: #555; text-align: center;">Không tìm thấy sản phẩm nào.</div>`;
    return;
  }

  renderItem(filtered);
};

const renderRandomImages = () => {
  const suggestionGrid = document.getElementById('searchSuggestionGrid');
  if (!suggestionGrid) return;
  const html = suggestionItems.map((item) => `
    <div class="search-suggestion-card">
      <img src="${item.HinhAnh}" alt="Gợi ý" />
    </div>
  `).join('');
  suggestionGrid.innerHTML = html;
};

const bindSearch = () => {
  if (searchBtn) {
    searchBtn.addEventListener('click', searchProducts);
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        searchProducts();
      }
    });
  }
};

const loadMore = () => {
  let moreItems = [];
  if (data.length > suggestionItems.length) {
    moreItems = data.slice(suggestionItems.length, suggestionItems.length + 10);
  } else {
    moreItems = buildSuggestionCards(10);
  }

  suggestionItems = suggestionItems.concat(moreItems);
  renderItem(suggestionItems);
  renderRandomImages();
};

function createProductHTML(item, index) {
  const formattedPrice = item.Gia
    ? Number(item.Gia).toLocaleString("vi-VN")
    : "0";
  const productId = item.IDSanPham || item.id || `suggest-${index + 1}`;
  const imageUrl = Array.isArray(item.HinhAnh)
    ? item.HinhAnh[0]
    : item.HinhAnh || `https://picsum.photos/320/320?random=${100 + index}`;
  return `
                    <a href="../HTML/chiTietSP.html?id=${encodeURIComponent(productId)}" class="card product-card" data-index="${index}">
                        <div class="card-img" style="background-image: url('${imageUrl}')">
                            <span class="badge-mall">Mall</span>
                        </div>
                        <div class="card-info">
                            <div class="card-name">${item.TenSanPham}</div>
                            <div class="card-price-row">
                                <span class="card-price">₫${formattedPrice}</span>
                                <span class="card-sold">Đã bán ${item.sold}</span>
                            </div>
                        </div>
                    </a>
                `;
}

document.querySelector(".logout-link").addEventListener("click", () => {
  localStorage.clear();
});

window.onload = () => {
  updateUserDisplay();
  bindSearch();
  updateCartBadge();
  getProduct();
};
