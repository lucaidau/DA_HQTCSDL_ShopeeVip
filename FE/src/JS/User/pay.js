const userRaw = localStorage.getItem("user");
const userID = JSON.parse(userRaw).IDNguoiMua;

const buyListRaw = localStorage.getItem("pendingOrder");
const buyList = JSON.parse(buyListRaw);

function openModal() {
  document.getElementById("modalList").style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function renderCheckoutItems() {
  const container = document.getElementById("checkout-products-list");
  const totalItemsPriceEl = document.getElementById("total-items-price");
  const totalFinalPriceEl = document.getElementById("total-final-price");

  if (!buyList || buyList.length === 0) {
    if (container) {
      container.innerHTML = `<div style="padding: 30px; text-align: center; color: #888;">Giỏ hàng chờ thanh toán trống!</div>`;
    }
    return;
  }

  // Tiêu đề Header chuẩn đồng bộ với CSS
  const headerHtml = `
    <div class="product-header">
      <div>Sản phẩm</div>
      <div>Đơn giá</div>
      <div>Số lượng</div>
      <div>Thành tiền</div>
    </div>
  `;

  let tongTienHang = 0;

  // Lặp qua danh sách để tạo chuỗi danh sách hàng hóa thẳng cột
  const itemsHtml = buyList
    .map((item) => {
      const itemTotal = item.ThanhTien || item.GiaBan * item.SoLuongMua;
      tongTienHang += itemTotal;

      const tenSP = item.TenSanPham || "Sản phẩm Shopee";
      const anhSP = item.HinhAnh || "https://via.placeholder.com/80";
      const phanLoai = item.TenBienThe || "Mặc định";
      const donGia = item.GiaBan || itemTotal / item.SoLuongMua;

      return `
      <div class="product-item">
        <div class="prod-info-block">
          <img src="${anhSP}" class="prod-img" alt="${tenSP}">
          <div class="prod-details">
            <div class="prod-name">${tenSP}</div>
            <div class="prod-cate">Phân loại: ${phanLoai}</div>
          </div>
        </div>
        <div class="prod-price">₫${donGia.toLocaleString("vi-VN")}</div>
        <div class="prod-qty">${item.SoLuongMua}</div>
        <div class="prod-subtotal">₫${itemTotal.toLocaleString("vi-VN")}</div>
      </div>
    `;
    })
    .join("");

  // Thực hiện ghi đè toàn bộ cấu trúc vào trong ID
  if (container) {
    container.innerHTML = headerHtml + itemsHtml;
  }

  // Cập nhật giá trị tiền tệ xuống phần tổng kết hóa đơn
  if (totalItemsPriceEl) {
    totalItemsPriceEl.innerText = `₫${tongTienHang.toLocaleString("vi-VN")}`;
  }
  if (totalFinalPriceEl) {
    const tongThanhToan = tongTienHang;
    totalFinalPriceEl.innerText = `₫${tongThanhToan.toLocaleString("vi-VN")}`;
  }
}
window.onload = async () => {
  renderCheckoutItems();

  document.getElementById("display-name").innerText =
    `${buyList[0].Ten} (+84) ${buyList[0].SDT}`;
  document.getElementById("display-address").innerHTML =
    `${buyList[0].DiaChi} ${buyList[0].DiaChi ? '<span class="badge">Mặc định</span>' : ""}`;

  console.log(userID);
  console.log(buyList);
};

async function processOrder() {
  try {
    const orderBtn = document.getElementById("dh");
    if (orderBtn) orderBtn.disabled = true;

    const noteInput = document.getElementById("ghiChu");
    const noteValue = noteInput ? noteInput.value : "";

    // Gọi API sang Backend
    const res = await fetch("http://localhost:3000/thanhtoan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userID: userID,
        buyList: buyList,
        note: noteValue,
      }),
    });

    const resultData = await res.json();

    if (res.ok && resultData.success) {
      localStorage.removeItem("pendingOrder");

      const modalSuccess = document.getElementById("modalSuccess");
      if (modalSuccess) modalSuccess.style.display = "flex";

      let timeLeft = 5;
      const secondsElement = document.getElementById("seconds");

      const countdown = setInterval(() => {
        timeLeft--;
        if (secondsElement) secondsElement.innerText = timeLeft;

        if (timeLeft <= 0) {
          clearInterval(countdown);
          window.location.href = "./home.html";
        }
      }, 1000);
    } else {
      // Nếu có lỗi từ Backend trả về
      alert(`Đặt hàng thất bại: ${resultData.message || "Lỗi không xác định"}`);
      if (orderBtn) orderBtn.disabled = false;
    }
  } catch (error) {
    console.error("Lỗi Fetch thanh toán:", error);
    alert("Hệ thống mạng lỗi hoặc không kết nối được Backend!");
    const orderBtn = document.getElementById("dh");
    if (orderBtn) orderBtn.disabled = false;
  }
}
