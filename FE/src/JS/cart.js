let itemsToDelete = [];
const modal = document.getElementById("delete-modal");
const modalMsg = document.getElementById("modal-message");
const CART_ITEMS_KEY = 'cartItems';

const grid = document.getElementById("product-grid");
const loading = document.getElementById("loading");

function getCartItems() {
  const stored = localStorage.getItem(CART_ITEMS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Không thể đọc giỏ hàng', error);
    return [];
  }
}

function setCartItems(items) {
  localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));
}

function getCartCountFromItems(items) {
  return items.reduce((sum, item) => sum + Number(item.quantity || item.SoLuongMua || 1), 0);
}

function syncCartCount(items) {
  const count = getCartCountFromItems(items || getCartItems());
  localStorage.setItem('cartCount', count);
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  return count;
}

function createCartItemHTML(item) {
  const id = item.id || item.IDSanPham || item.IDBanSao || `item-${Date.now()}`;
  const quantityId = `qty_${id}`;
  const name = item.name || item.TenSanPham || 'Sản phẩm';
  const variant = item.variant || item.BienThe || 'Mặc định';
  const numericPrice = Number(item.price || item.GiaBan || item.Gia || 0);
  const quantity = Number(item.quantity || item.SoLuongMua || 1);
  const image = item.image || item.HinhAnh || 'https://picsum.photos/100/100';
  const subtotal = numericPrice * quantity;

  return `
    <div class="shop-section" data-product-id="${id}">
        <div class="shop-header">
            <input type="checkbox" class="shop-checkbox"> 
            <span class="badge-yeuthich">Gợi ý</span>
            <strong>Cửa hàng của ${name.split(" ")[0] || 'Shop'}</strong>
            <i class="fa-solid fa-comment-dots" style="color: var(--shopee-orange);"></i>
        </div>
        <div class="cart-item">
            <input type="checkbox" class="item-checkbox" data-price="${numericPrice}">
            <div class="item-info">
                <img src="${image}" alt="product">
                <div>
                    <div class="item-name">${name}</div>
                    <div class="item-variant">${variant} <i class="fa-solid fa-caret-down"></i></div>
                </div>
            </div>
            <div style="text-align: center;">₫${numericPrice.toLocaleString('vi-VN')}</div>
            <div style="display: flex; justify-content: center;">
                <div class="quantity-control">
                    <button class="btn-qty" data-target="${quantityId}" data-delta="-1">-</button>
                    <input type="text" id="${quantityId}" class="qty-input" value="${quantity}" readonly>
                    <button class="btn-qty" data-target="${quantityId}" data-delta="1">+</button>
                </div>
            </div>
            <div style="text-align: center;" class="price-subtotal">₫${subtotal.toLocaleString('vi-VN')}</div>
            <div style="text-align: center;">
                <button class="btn-delete">Xóa</button>
            </div>
        </div>
    </div>
    `;
}

function syncCartFromDOM() {
  const sections = document.querySelectorAll('.shop-section');
  const updatedCart = Array.from(sections).map((section) => {
    const id = section.dataset.productId;
    const cartItem = section.querySelector('.cart-item');
    const price = Number(cartItem.querySelector('.item-checkbox').getAttribute('data-price'));
    const qty = Number(cartItem.querySelector('.qty-input').value);
    const name = cartItem.querySelector('.item-name').innerText;
    const variant = cartItem.querySelector('.item-variant').innerText.replace(' ▼', '').trim();
    const image = cartItem.querySelector('img')?.src || '';
    return { id, name, variant, price, quantity: qty, image };
  });
  setCartItems(updatedCart);
  return updatedCart;
}

function updateTotal() {
  let totalItems = 0;
  let totalPrice = 0;

  const selectedItems = document.querySelectorAll(".item-checkbox:checked");

  selectedItems.forEach((checkbox) => {
    const cartItem = checkbox.closest(".cart-item");
    const price = parseInt(checkbox.getAttribute("data-price"));
    const qtyInput = cartItem.querySelector(".qty-input");
    const qty = parseInt(qtyInput.value);

    totalItems += qty;
    totalPrice += price * qty;
  });

  const footer = document.querySelector(".footer-checkout");
  if (!footer) return;

  footer.querySelector(".total-amount span").innerText =
    `₫${totalPrice.toLocaleString("vi-VN")}`;
  footer.querySelector(".checkout-left label").innerText =
    `Chọn Tất Cả (${totalItems})`;
  footer.querySelector(".total-amount div:first-child").innerHTML =
    `Tổng thanh toán (${totalItems} sản phẩm): <span>₫${totalPrice.toLocaleString("vi-VN")}</span>`;
}

function renderCartItems(items) {
  if (!items.length) {
    grid.innerHTML = '<div style="padding: 40px; color: #555; text-align: center;">Giỏ hàng đang trống.</div>';
    updateTotal();
    return;
  }

  grid.innerHTML = items.map((item) => createCartItemHTML(item)).join('');
  updateTotal();
}

async function loadCartItems() {
  loading.style.display = 'block';
  const localCart = getCartItems();
  if (localCart.length) {
    renderCartItems(localCart);
    syncCartCount(localCart);
    loading.style.display = 'none';
    return;
  }

  const userID = localStorage.getItem('userID');
  if (!userID) {
    grid.innerHTML = '<div style="padding: 40px; color: #555; text-align: center;">Giỏ hàng đang trống.</div>';
    loading.style.display = 'none';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/giohang/${userID}`);
    const data = await res.json();
    const cartItems = data.cart || [];

    if (!cartItems.length) {
      grid.innerHTML = '<div style="padding: 40px; color: #555; text-align: center;">Giỏ hàng đang trống.</div>';
      loading.style.display = 'none';
      updateTotal();
      return;
    }

    const normalized = cartItems.map((item) => ({
      id: item.IDSanPham || item.IDBanSao || `item-${Date.now()}`,
      name: item.TenSanPham || 'Sản phẩm',
      variant: item.BienThe || 'Mặc định',
      price: Number(item.GiaBan || item.Gia || 0),
      quantity: Number(item.SoLuongMua || 1),
      image: item.HinhAnh || 'https://picsum.photos/100/100',
    }));

    setCartItems(normalized);
    renderCartItems(normalized);
    syncCartCount(normalized);
    loading.style.display = 'none';
  } catch (error) {
    console.error('Không thể tải giỏ hàng:', error);
    grid.innerHTML = '<div style="padding: 40px; color: #555; text-align: center;">Lỗi khi tải giỏ hàng.</div>';
    loading.style.display = 'none';
  }
}

// no random cart loading anymore
// Cập nhật lại hàm updateTotal cho chính xác
function updateTotal() {
  let totalItems = 0;
  let totalPrice = 0;

  const selectedItems = document.querySelectorAll(".item-checkbox:checked");

  selectedItems.forEach((checkbox) => {
    const cartItem = checkbox.closest(".cart-item");
    const price = parseInt(checkbox.getAttribute("data-price"));
    const qtyInput = cartItem.querySelector(".qty-input");
    const qty = parseInt(qtyInput.value);

    totalItems += qty;
    totalPrice += price * qty;
  });

  const footer = document.querySelector(".footer-checkout");
  // Cập nhật số tiền
  footer.querySelector(".total-amount span").innerText =
    `₫${totalPrice.toLocaleString("vi-VN")}`;
  // Cập nhật số lượng ở nút chọn tất cả
  footer.querySelector(".checkout-left label").innerText =
    `Chọn Tất Cả (${totalItems})`;
  // Cập nhật dòng tổng thanh toán
  footer.querySelector(".total-amount div:first-child").innerHTML =
    `Tổng thanh toán (${totalItems} sản phẩm): <span>₫${totalPrice.toLocaleString("vi-VN")}</span>`;
}

// Lắng nghe sự kiện click trên toàn bộ danh sách sản phẩm (Event Delegation)
grid.addEventListener("change", function (e) {
  // 1. Nếu nhấn vào checkbox của SHOP
  if (e.target.classList.contains("shop-checkbox")) {
    const shopSection = e.target.closest(".shop-section");
    const itemCheckboxes = shopSection.querySelectorAll(".item-checkbox");
    itemCheckboxes.forEach((cb) => (cb.checked = e.target.checked));
    updateTotal();
  }

  // 2. Nếu nhấn vào checkbox của SẢN PHẨM
  if (e.target.classList.contains("item-checkbox")) {
    const shopSection = e.target.closest(".shop-section");
    const shopCheckbox = shopSection.querySelector(".shop-checkbox");
    const allItems = shopSection.querySelectorAll(".item-checkbox");
    const checkedItems = shopSection.querySelectorAll(".item-checkbox:checked");

    // Tự động tích/bỏ tích shop checkbox nếu tất cả sản phẩm con được chọn
    shopCheckbox.checked = allItems.length === checkedItems.length;
    updateTotal();
  }
});

// Lắng nghe nút tăng giảm số lượng
grid.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-qty")) {
    const inputId = e.target.getAttribute("data-target");
    const delta = parseInt(e.target.getAttribute("data-delta"));
    const input = document.getElementById(inputId);

    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    input.value = val;

    // Cập nhật lại thành tiền của dòng đó (Subtotal)
    const cartItem = e.target.closest(".cart-item");
    const price = parseInt(
      cartItem.querySelector(".item-checkbox").getAttribute("data-price"),
    );
    cartItem.querySelector(".price-subtotal").innerText =
      `₫${(price * val).toLocaleString("vi-VN")}`;

    updateTotal();
    const updatedCart = syncCartFromDOM();
    syncCartCount(updatedCart);
  }
  // THÊM ĐOẠN NÀY: Xử lý nút Xóa từng dòng
  if (e.target.classList.contains("btn-delete")) {
    const shopSection = e.target.closest(".shop-section");
    itemsToDelete = [shopSection]; // Lưu lại hàng cần xóa
    modalMsg.innerText = "Bạn có muốn bỏ 1 sản phẩm?";
    modal.style.display = "flex"; // Hiện modal
  }
});

// Xử lý nút "Chọn tất cả" ở dưới Footer
document
  .getElementById("check-all-footer")
  .addEventListener("change", function (e) {
    const allCheckboxes = document.querySelectorAll(
      ".shop-checkbox, .item-checkbox",
    );
    allCheckboxes.forEach((cb) => (cb.checked = e.target.checked));
    updateTotal();
  });
// Nút TRỞ LẠI
document.getElementById("btn-cancel").addEventListener("click", () => {
  modal.style.display = "none";
  itemsToDelete = [];
});

// Nút CÓ (Thực hiện xóa)
document.getElementById("btn-confirm").addEventListener("click", () => {
  itemsToDelete.forEach((item) => {
    item.remove(); // Xóa khỏi giao diện
  });

  modal.style.display = "none";
  itemsToDelete = [];
  const updatedCart = syncCartFromDOM();
  syncCartCount(updatedCart);
  updateTotal(); // Tính lại tổng tiền sau khi xóa
});
// Thêm đoạn này vào bất kỳ đâu trong script
document
  .querySelector(".checkout-left .btn-delete")
  .addEventListener("click", function () {
    const selectedCheckboxes = document.querySelectorAll(
      ".item-checkbox:checked",
    );

    if (selectedCheckboxes.length > 0) {
      // Lấy tất cả các shop-section của các sản phẩm đã chọn
      itemsToDelete = Array.from(selectedCheckboxes).map((cb) =>
        cb.closest(".shop-section"),
      );
      modalMsg.innerText = `Bạn có muốn bỏ ${selectedCheckboxes.length} sản phẩm?`;
      modal.style.display = "flex";
    } else {
      alert("Vui lòng chọn sản phẩm để xóa!");
    }
  });
// Tải lần đầu
window.addEventListener('load', loadCartItems);
