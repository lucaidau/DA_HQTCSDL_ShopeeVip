let data = [];

const getProduct = async () => {
  try {
    const res = await fetch("http://localhost:3000/sanpham");
    const dt = await res.json();

    data = dt.danhSachSanPham[0];
    console.log(dt);

    renderItem();
  } catch (error) {
    console.error("Lỗi lấy sản phẩm");
  }
};

const grid = document.getElementById("productGrid");

const renderItem = () => {
  if (!data || data.length === 0) return;
  let html = data.map((item) => createProductHTML(item)).join("");

  grid.innerHTML = html;
};

function createProductHTML(item) {
  const formattedPrice = item.Gia
    ? Number(item.Gia).toLocaleString("vi-VN")
    : "0";
  return `
                    <a href="../HTML/chiTietSP.html?id=${item.IDSanPham}" class="card">
                        <div class="card-img" style="background-image: url('${item.HinhAnh}')">
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

window.onload = getProduct;
