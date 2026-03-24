const urlParams = new URLSearchParams(window.location.search);
const productID = urlParams.get("id");

const getProductDetail = async () => {
  try {
    const res = await fetch(`http://localhost:3000/sanpham/${productID}`);
    const detail = await res.json();
    const product = detail.san_pham;
    return product;
  } catch (error) {
    console.error("Không thấy ID sản phẩm");
  }
};

const countCartItem = async () => {
  try {
    const userID = localStorage.getItem("userID");
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
  badge.textContent = count > 99 ? "99+" : count;
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

function addToCart() {
  const qty = parseInt(document.getElementById("qtyInput").value) || 1;
  cartCount += qty;
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
const discount = document.getElementById("prodOldPrice")
const price = document.getElementById("prodNewPrice")

window.onload = async () => {
  const cartData = await countCartItem();
  productDetail = await getProductDetail();

  const totalQuantity = cartData.cart.reduce(
    (sum, item) => sum + item.SoLuongMua,
    0,
  );
  cartCount = totalQuantity;
  updateCartBadge(cartCount);

  const formatPrice = productDetail.GiaBan ? Number(productDetail.GiaBan).toLocaleString('vi-VN') : "0";
  const formatDiscount = productDetail.GiaBan ? Number(productDetail.GiaBan / (48/100)).toLocaleString('vi-VN') : "0";
  productTitle.innerText = productDetail.TenSanPham
  price.innerText = "₫"+formatPrice;
  discount.innerText = "₫" + formatDiscount
};
