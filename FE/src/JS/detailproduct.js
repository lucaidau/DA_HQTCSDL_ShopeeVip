const CART_COUNT_KEY = 'cartCount';
const CART_ITEMS_KEY = 'cartItems';
const urlParams = new URLSearchParams(window.location.search);
const productID = urlParams.get("id");

const getCartCount = () => Number(localStorage.getItem(CART_COUNT_KEY) || 0);
const setCartCount = (count) => localStorage.setItem(CART_COUNT_KEY, count);
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
const setCartItems = (items) => localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));

const getSelectedProductFallback = () => {
  const stored = localStorage.getItem('selectedProduct');
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.warn('Không thể đọc sản phẩm đã chọn', error);
    return [];
  }
};

const getProductDetail = async () => {
  if (!productID) {
    return getSelectedProductFallback();
  }

  try {
    const res = await fetch(`http://localhost:3000/sanpham/${productID}`);
    const detail = await res.json();
    const product = detail.san_pham || detail || [];
    if (Array.isArray(product) && product.length) return product;
    if (product && typeof product === 'object') return [product];
    return getSelectedProductFallback();
  } catch (error) {
    console.error("Không thể lấy chi tiết sản phẩm", error);
    return getSelectedProductFallback();
  }
};

const userID = localStorage.getItem("userID");
const countCartItem = async () => {
  try {
    const res = await fetch(`http://localhost:3000/giohang/${userID}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Không thể lấy giỏ hàng");
  }
};

// ============================================================
// CART LOGIC
// ============================================================
let cartCount = 0;
let productDetail;

let toastTimer = null;

function updateCartBadge(count) {
  const badge = document.querySelector(".cart-badge");
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? "99+" : count;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }

  // Animate badge
  badge.style.transform = "scale(1.5)";
  badge.style.transition = "transform 0.2s ease";
  setTimeout(() => {
    badge.style.transform = "scale(1)";
  }, 200);
}

function showToast(qty) {
  const toast = document.getElementById("cartToast");
  const sub = document.getElementById("toastSub");
  sub.textContent = qty + " sản phẩm được thêm thành công.";
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hideToast(), 3000);
}

function hideToast() {
  document.getElementById("cartToast").classList.remove("show");
}

const qtyTxt = document.getElementById("qtyInput");
let qty = parseInt(document.getElementById("qtyInput").value) || 1;

const updateQty = (sigma) => {
  const selectedBtn = document.querySelector(".btn-attr.active");
  const defaultStock = Array.isArray(productDetail) && productDetail[0]
    ? parseInt(productDetail[0].SoLuongTonKho || productDetail[0].SoLuongTonKho || 999)
    : 999;
  let maxStock = selectedBtn
    ? parseInt(selectedBtn.getAttribute("data-stock"))
    : defaultStock;

  if (!maxStock || maxStock < 1) maxStock = 999;

  qty += sigma;
  if (qty < 1) qty = 1;
  if (qty > maxStock) qty = maxStock;
  qtyTxt.value = qty;
};

function addToCart() {
  qty = qty <= 0 ? 1 : qty;
  const currentProduct = Array.isArray(productDetail) ? productDetail[0] : productDetail;
  const itemId = currentProduct.IDBanSao || currentProduct.IDSanPham || productID || `product-${Date.now()}`;
  const image = Array.isArray(currentProduct.HinhAnh)
    ? currentProduct.HinhAnh[0]
    : currentProduct.HinhAnh || '';

  const cartItems = getCartItems();
  const existingIndex = cartItems.findIndex(
    (item) => item.id === itemId && item.variant === (currentProduct.BienThe || '')
  );

  const cartItem = {
    id: itemId,
    name: currentProduct.TenSanPham || currentProduct.title || 'Sản phẩm',
    price: Number(currentProduct.GiaBan || currentProduct.Gia || 0),
    image,
    variant: currentProduct.BienThe || '',
    quantity: qty,
  };

  if (existingIndex >= 0) {
    cartItems[existingIndex].quantity += qty;
  } else {
    cartItems.push(cartItem);
  }

  setCartItems(cartItems);
  cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  setCartCount(cartCount);

  updateCartBadge(cartCount);
  showToast(qty);

  // Briefly animate the button
  const btn = document.querySelector(".btn-add-cart");
  const original = btn.innerHTML;
  btn.innerHTML =
    '<i class="fas fa-check" style="font-size:18px"></i> Đã Thêm Vào Giỏ!';
  btn.style.background = "#d4f5e2";
  btn.style.color = "#00865a";
  btn.style.borderColor = "#00865a";
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = "";
    btn.style.color = "";
    btn.style.borderColor = "";
  }, 1800);
}

function buyNow() {
  addToCart();
}

const productTitle = document.getElementById("prodTitle");
const discount = document.getElementById("prodOldPrice");
const price = document.getElementById("prodNewPrice");

window.onload = async () => {
  const cartData = await countCartItem();
  productDetail = await getProductDetail();
  const currentProduct = Array.isArray(productDetail) ? productDetail[0] : productDetail;

  if (!currentProduct || Object.keys(currentProduct).length === 0) {
    console.error("Không tìm thấy sản phẩm hoặc sản phẩm không hợp lệ.");
    return;
  }

  const apiQuantity = ((cartData && cartData.cart) || []).reduce(
    (sum, item) => sum + item.SoLuongMua,
    0,
  );
  const storedCount = getCartCount();
  const localItemsCount = getCartItems().reduce(
    (sum, item) => sum + Number(item.quantity || item.SoLuongMua || 1),
    0,
  );
  cartCount = storedCount || localItemsCount || apiQuantity;
  setCartCount(cartCount);
  updateCartBadge(cartCount);

  const formatPrice = currentProduct.GiaBan
    ? Number(currentProduct.GiaBan).toLocaleString("vi-VN")
    : currentProduct.Gia
    ? Number(currentProduct.Gia).toLocaleString("vi-VN")
    : "0";
  const formatDiscount = currentProduct.GiaBan
    ? Number(currentProduct.GiaBan / (48 / 100)).toLocaleString("vi-VN")
    : "0";

  const rating = currentProduct.DiemDanhGia || currentProduct.Rating || 4.9;
  const reviewCount = currentProduct.SoDanhGia || currentProduct.Reviews || '141';
  const soldCount = currentProduct.DaBan || currentProduct.sold || '4,5k';

  productTitle.innerText = currentProduct.TenSanPham || currentProduct.title || 'Sản phẩm';
  price.innerText = "₫" + formatPrice;
  discount.innerText = "₫" + formatDiscount;
  document.getElementById('prodRating').innerText = rating;
  document.getElementById('prodReviews').innerText = `${reviewCount} Đánh Giá`;
  document.getElementById('prodSold').innerText = soldCount;

  CreateCopyProduct(productDetail);
  updateUI(productDetail);
};

const CreateCopyProduct = (detail) => {
  let typeList = document.querySelector(".form-content");
  let htmlContent = "";

  for (let i = 0; i < detail.length; i++) {
    htmlContent += `
      <button class="btn-attr" data-stock ="${detail[i].SoLuongTonKho}">
        <img src = "${detail[i].HinhAnh[1] || detail[i].HinhAnh[0]}">
        ${detail[i].BienThe}
      </button>
    `;
  }
  typeList.innerHTML = htmlContent;

  const allBtn = document.querySelectorAll(".btn-attr");
  if (allBtn.length > 0) {
    allBtn[0].classList.add("active");
    const firstStock = parseInt(allBtn[0].getAttribute("data-stock")) || 999;
    document.getElementById("mainImg").src = allBtn[0].querySelector("img").src;
    document.getElementById("tonKho").innerText = `${firstStock} có sẵn`;
    qtyTxt.value = 1;
    qty = 1;
  }

  allBtn.forEach((item) => {
    item.addEventListener("click", function (e) {
      const currSelected = typeList.querySelector(".btn-attr.active");
      if (currSelected) {
        currSelected.classList.remove("active");
      }
      this.classList.add("active");
      document.getElementById("mainImg").src = this.querySelector("img").src;
      const stock = parseInt(this.getAttribute("data-stock")) || 999;
      document.getElementById("tonKho").innerText = `${stock} có sẵn`;

      if (qty > stock) {
        qty = stock;
      }
      qtyTxt.value = qty;
    });
  });

  let thumbList = document.getElementById("thumbList");
  let htmlThumList = ""

  for(let i = 0; i < detail.length; i++)
  {
    htmlThumList += 
    `
      <img class="thumb-img" src="${detail[i].HinhAnh[1] || detail[i].HinhAnh[0]}">
    `
  }
  thumbList.innerHTML = htmlThumList;

  const mainImg = document.getElementById("mainImg");
  const allImg = thumbList.querySelectorAll(".thumb-img");
  allImg.forEach(item=>{
    item.addEventListener("click", function(e){
      mainImg.src = this.src;
    })
  })


};

const updateUI = (detail) => {
  const txtTonKho = document.getElementById("tonKho");
  let txtMoTa = document.getElementById("description");

  const mainImg = document.getElementById("mainImg");

  mainImg.src = `${detail[0].HinhAnh[0]}`;
  txtTonKho.innerText = `${detail[0].SoLuongTonKho} có sẵn`;
  txtMoTa.innerText = `${detail[0].MoTa}`;
};

const AddToCart = () => {
  const product = {
    userID: userID,

    quantity: qty,
  };
};
