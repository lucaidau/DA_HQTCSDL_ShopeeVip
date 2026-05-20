function openModal() {
  renderAddressList();
  document.getElementById("modalList").style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Hiển thị danh sách địa chỉ trong Modal 1
function renderAddressList() {
  const container = document.getElementById("addr-items-container");
  container.innerHTML = data
    .map(
      (item, i) => `
                <label style="display: flex; padding: 15px 0; border-bottom: 1px solid #eee; gap: 15px; cursor: pointer;">
                    <input type="radio" name="addr-radio" value="${i}" ${item.def ? "checked" : ""} style="accent-color: #ee4d2d; width: 18px;">
                    <div style="font-size: 14px;">
                        <b>${item.n} | (+84) ${item.p}</b> 
                        <span style="color: #00bfa5; margin-left: 10px;">Cập nhật</span><br>
                        <span style="color: #888;">${item.d}</span><br>
                        ${item.def ? '<span class="badge" style="margin-left:0; margin-top:5px; display:inline-block;">Mặc định</span>' : ""}
                    </div>
                </label>
            `,
    )
    .join("");
}

// Mở Modal 2
function openNewAddrModal() {
  closeModal("modalList");
  document.getElementById("modalNew").style.display = "flex";
}

// Xử lý chọn loại địa chỉ (Nhà riêng/Văn phòng)
function setType(btn) {
  document
    .querySelectorAll(".btn-type")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

// Logic thêm địa chỉ mới vào mảng dữ liệu
function addNewAddress() {
  const name = document.getElementById("new-name").value;
  const phone = document.getElementById("new-phone").value;
  const city = document.getElementById("new-city").value;
  const detail = document.getElementById("new-detail").value;
  const isDef = document.getElementById("new-default").checked;

  if (!name || !phone || !city || !detail) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  // Nếu đặt làm mặc định, hủy các mặc định cũ
  if (isDef) {
    data.forEach((item) => (item.def = false));
  }

  // Thêm vào mảng
  data.push({
    n: name,
    p: phone,
    d: detail + ", " + city,
    def: isDef,
  });

  // Quay lại Modal danh sách
  closeModal("modalNew");
  openModal();

  // Reset form
  document.getElementById("new-name").value = "";
  document.getElementById("new-phone").value = "";
  document.getElementById("new-city").value = "";
  document.getElementById("new-detail").value = "";
  document.getElementById("new-default").checked = false;
}

// Xác nhận chọn địa chỉ từ danh sách để hiển thị ra trang chính
function confirmAddrSelection() {
  const selected = document.querySelector('input[name="addr-radio"]:checked');
  if (selected) {
    const sel = data[selected.value];
    document.getElementById("display-name").innerText =
      `${sel.n} (+84) ${sel.p}`;
    document.getElementById("display-address").innerHTML =
      `${sel.d} ${sel.def ? '<span class="badge">Mặc định</span>' : ""}`;
    closeModal("modalList");
  }
}
function processOrder() {
  document.getElementById("modalSuccess").style.display = "flex";
  let timeLeft = 5;
  const secondsElement = document.getElementById("seconds");

  // Lấy thông tin địa chỉ hiện tại để lưu lại
  const currentName = document.getElementById("display-name").innerText;
  const currentAddr = document.getElementById("display-address").innerText;

  const targetUrl = "home.html"; // Nên dùng link tương đối cho ổn định

  const countdown = setInterval(function () {
    timeLeft--;
    secondsElement.innerText = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      window.location.href = targetUrl;
    }
  }, 1000);
}
