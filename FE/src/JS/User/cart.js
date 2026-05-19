// Thêm đoạn này vào đầu script
let itemsToDelete = [];
const modal = document.getElementById("delete-modal");
const modalMsg = document.getElementById("modal-message");
// Hàm đổi số lượng
function changeQty(id, delta) {
  const input = document.getElementById(id);
  let val = parseInt(input.value);
  val += delta;
  if (val < 1) val = 1;
  input.value = val;
}

const grid = document.getElementById("product-grid");
const loading = document.getElementById("loading");

function createProductHTML(cart) {
  const numericPrice = Number(cart.GiaBan).toLocaleString("vi-VN");
  const procName = cart.TenSanPham + " " + (cart.BienThe || "");
  return `
    <div class="shop-section">
        <div class="shop-header">
            <input type="checkbox" class="shop-checkbox"> 
            <span class="badge-yeuthich">Gợi ý</span>
            <strong>${cart.Ten}</strong>
            <i class="fa-solid fa-comment-dots" style="color: var(--shopee-orange);"></i>
        </div>
        <div class="cart-item">
            <input type="checkbox" class="item-checkbox" data-price="${cart.GiaBan}" data-id-bansao="${cart.IDBanSao}">
            <div class="item-info">
                <img src="${cart.HinhAnh}" alt="productImg">
                <div>
                    <div class="item-name">${procName}</div>
                    <div class="item-variant">Phân loại hàng: Mặc định <i class="fa-solid fa-caret-down"></i></div>
                </div>
            </div>
            <div style="text-align: center;">₫${numericPrice}</div>
            <div style="display: flex; justify-content: center;">
                <div class="quantity-control">
                    <button class="btn-qty" data-target="${cart.IDBanSao}" data-delta="-1">-</button>
                    <input type="text" id="${cart.IDBanSao}" class="qty-input" value="${cart.SoLuongMua}" readonly>
                    <button class="btn-qty" data-target="${cart.IDBanSao}" data-delta="1">+</button>
                </div>
            </div>
            <div style="text-align: center;" class="price-subtotal">₫${cart.ThanhTien.toLocaleString("vi-VN")}</div>
            <div style="text-align: center;">
                <button class="btn-delete data-id-bansao="${cart.IDBanSao}">Xóa</button>
            </div>
        </div>
    </div>
    `;
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
  // Cập nhật số tiền
  footer.querySelector(".total-amount span").innerText =
    `₫${totalPrice.toLocaleString("vi-VN")}`;
  // Cập nhật số lượng ở nút chọn tất cả
  footer.querySelector(".checkout-left label").innerText =
    `Chọn Tất Cả (${totalItems})`;
  // Cập nhật dòng tổng thanh toán
  footer.querySelector(".total-amount div:first-child").innerHTML =
    `Tổng thanh toán (${selectedItems.length} sản phẩm): <span>${totalPrice.toLocaleString("vi-VN")}₫</span>`;
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

const userRaw = localStorage.getItem("user");
const userData = JSON.parse(userRaw);
const userID = userData.IDTaiKhoan;
console.log(userID);
const LayCart = async () => {
  try {
    const res = await fetch(`http://localhost:3000/giohang/${userID}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("Không thể lấy giỏ hàng: ", error);
  }
};

const xoaSpTrongCart = async (copyID) => {
  try {
    const deleteProc = {
      userID: userID,
      copyID: copyID,
    };
    const res = await fetch(`http://localhost:3000/giohang/xoasp`, {
      method: "DELETE",
      headers: {},
      body: JSON.stringify(),
    });
  } catch (error) {
    console.log("Không thể xóa sản phẩm: ", error);
  }
};

window.onload = async () => {
  try {
    grid.innerHTML = "";

    const cartData = await LayCart();
    const cart = cartData.cart;

    if (cart.length > 0) {
      console.log(`Sản phẩm từ giỏ hàng của người dùng ${userID}: `, cart);
      let htmlContent = "";
      cart.forEach((item) => {
        htmlContent += createProductHTML(item);
      });
      grid.innerHTML = htmlContent;
      updateTotal();
    } else {
      grid.innerHTML = `<div style="text-align: center; padding: 80px 0; font-size: 16px; color: #555;">
            <i class="fa-solid fa-basket-shopping" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
            <div>Giỏ hàng của bạn còn trống.</div>
        </div>`;
      updateTotal();
    }
  } catch (error) {
    console.log("Lỗi khi tải giỏ hàng: ", error);
    grid.innerHTML = `<div style="text-align:center; color:red; padding: 50px 0;">Không thể tải dữ liệu giỏ hàng lúc này.</div>`;
  }
};
