const data = [
  {
    name: "Áo Khoác Cardigan Lovito Dệt Kim Túi Vá Phẳng",
    price: "134.406",
    sold: "2,1k",
    img: "1",
  },
  {
    name: "Chân Váy Dài Xẻ Tà Lovito Phong Cách Hàn Quốc",
    price: "119.777",
    sold: "850",
    img: "2",
  },
  {
    name: "Bông Tai Ngọc Trai Nhân Tạo Đính Đá Sang Trọng",
    price: "13.000",
    sold: "12k",
    img: "3",
  },
  {
    name: "Khăn Giấy Ướt Gấu Dâu 80 Tờ Siêu Mềm Mại",
    price: "9.900",
    sold: "50k",
    img: "4",
  },
  {
    name: "Áo Sơ Mi Nam Kẻ Caro Form Rộng Unisex",
    price: "89.000",
    sold: "1,2k",
    img: "5",
  },
  {
    name: "Ghế Nhựa Gấp Gọn Đa Năng Cho Gia Đình",
    price: "17.100",
    sold: "3k",
    img: "6",
  },

  {
    name: "Áo Khoác Cardigan Lovito Dệt Kim Túi Vá Phẳng",
    price: "134.406",
    sold: "2,1k",
    img: "1",
  },
  {
    name: "Chân Váy Dài Xẻ Tà Lovito Phong Cách Hàn Quốc",
    price: "119.777",
    sold: "850",
    img: "2",
  },
  {
    name: "Bông Tai Ngọc Trai Nhân Tạo Đính Đá Sang Trọng",
    price: "13.000",
    sold: "12k",
    img: "3",
  },
  {
    name: "Khăn Giấy Ướt Gấu Dâu 80 Tờ Siêu Mềm Mại",
    price: "9.900",
    sold: "50k",
    img: "4",
  },
  {
    name: "Áo Sơ Mi Nam Kẻ Caro Form Rộng Unisex",
    price: "89.000",
    sold: "1,2k",
    img: "5",
  },
  {
    name: "Ghế Nhựa Gấp Gọn Đa Năng Cho Gia Đình",
    price: "17.100",
    sold: "3k",
    img: "6",
  },

  {
    name: "Áo Khoác Cardigan Lovito Dệt Kim Túi Vá Phẳng",
    price: "134.406",
    sold: "2,1k",
    img: "1",
  },
  {
    name: "Chân Váy Dài Xẻ Tà Lovito Phong Cách Hàn Quốc",
    price: "119.777",
    sold: "850",
    img: "2",
  },
  {
    name: "Bông Tai Ngọc Trai Nhân Tạo Đính Đá Sang Trọng",
    price: "13.000",
    sold: "12k",
    img: "3",
  },
  {
    name: "Khăn Giấy Ướt Gấu Dâu 80 Tờ Siêu Mềm Mại",
    price: "9.900",
    sold: "50k",
    img: "4",
  },
  {
    name: "Áo Sơ Mi Nam Kẻ Caro Form Rộng Unisex",
    price: "89.000",
    sold: "1,2k",
    img: "5",
  },
  {
    name: "Ghế Nhựa Gấp Gọn Đa Năng Cho Gia Đình",
    price: "17.100",
    sold: "3k",
    img: "6",
  },
];

const grid = document.getElementById("productGrid");

function createProductHTML(item) {
  return `
                    <a href="#" class="card">
                        <div class="card-img" style="background-image: url('https://picsum.photos/300/300?random=${Math.random()}')">
                            <span class="badge-mall">Mall</span>
                        </div>
                        <div class="card-info">
                            <div class="card-name">${item.name}</div>
                            <div class="card-price-row">
                                <span class="card-price">₫${item.price}</span>
                                <span class="card-sold">Đã bán ${item.sold}</span>
                            </div>
                        </div>
                    </a>
                `;
}

// Load 12 sản phẩm ban đầu (2 hàng)
window.onload = function () {
  let html = "";
  for (let i = 0; i < 2; i++) {
    data.forEach((item) => (html += createProductHTML(item)));
  }
  grid.innerHTML = html;
};

// Hàm khi nhấn nút "Xem thêm"
function loadMore() {
  let moreHtml = "";
  data.forEach((item) => (moreHtml += createProductHTML(item)));
  grid.insertAdjacentHTML("beforeend", moreHtml);
}

document.querySelector(".logout-link").addEventListener("click", () => {
  localStorage.clear();
});
