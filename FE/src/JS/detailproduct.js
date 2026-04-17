const urlParams = new URLSearchParams(window.location.search);
const productID = urlParams.get("id");

const getProductDetail = async () => {
  try {
    const res = await fetch(`http://localhost:3000/sanpham/${productID}`);
    const detail = await res.json();
    const product = detail.san_pham;

    return product[0];
  } catch (error) {
    console.error("Không thấy ID sản phẩm");
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

const qtyTxt = document.getElementById("qtyInput");
let qty = parseInt(document.getElementById("qtyInput").value) || 1;

const updateQty = (sigma) => {
  const selectedBtn = document.querySelector(".btn-attr.active");
  const maxStock = selectedBtn
    ? parseInt(selectedBtn.getAttribute("data-stock"))
    : 1;

  qty += sigma;

  if (qty < 1) qty = 1;

  if (qty > maxStock) qty = maxStock;
  qtyTxt.value = qty;
};

function addToCart() {
  qty = qty <= 0 ? 1 : qty;
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
const discount = document.getElementById("prodOldPrice");
const price = document.getElementById("prodNewPrice");

window.onload = async () => {
  const cartData = await countCartItem();
  productDetail = await getProductDetail();
  console.log(productDetail);
  const totalQuantity = cartData.cart.reduce(
    (sum, item) => sum + item.SoLuongMua,
    0,
  );
  cartCount = totalQuantity;
  updateCartBadge(cartCount);

  const formatPrice = productDetail[0].GiaBan
    ? Number(productDetail[0].GiaBan).toLocaleString("vi-VN")
    : "0";
  const formatDiscount = productDetail[0].GiaBan
    ? Number(productDetail[0].GiaBan / (48 / 100)).toLocaleString("vi-VN")
    : "0";
  productTitle.innerText = productDetail[0].TenSanPham;
  price.innerText = "₫" + formatPrice;
  discount.innerText = "₫" + formatDiscount;

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
  allBtn.forEach((item) => {
    item.addEventListener("click", function (e) {
      const currSelected = typeList.querySelector(".btn-attr.active");
      if (currSelected) {
        currSelected.classList.remove("active");
      }
      this.classList.add("active");
      document.getElementById("mainImg").src = this.querySelector("img").src;
      document.getElementById("tonKho").innerText =
        `${this.getAttribute("data-stock")} có sẵn`;

      qtyTxt.max = this.getAttribute("data-stock");
      if (parseInt(qtyTxt.value) > this.getAttribute("data-stock")) {
        qtyTxt.value = this.getAttribute("data-stock");
        qty = this.getAttribute("data-stock");
      }
    });
  });

  let thumbList = document.getElementById("thumbList");
  let htmlThumList = "";

  for (let i = 0; i < detail.length; i++) {
    htmlThumList += `
      <img class="thumb-img" src="${detail[i].HinhAnh[1] || detail[i].HinhAnh[0]}">
    `;
  }
  thumbList.innerHTML = htmlThumList;

  const mainImg = document.getElementById("mainImg");
  const allImg = thumbList.querySelectorAll(".thumb-img");
  allImg.forEach((item) => {
    item.addEventListener("click", function (e) {
      mainImg.src = this.src;
    });
  });
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
