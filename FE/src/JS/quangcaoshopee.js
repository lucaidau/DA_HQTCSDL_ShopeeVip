// Dữ liệu mô phỏng
let adCampaigns = [
  {
    id: "AD001",
    name: "Sale Áo Thun Nam Mùa Hè",
    type: "Quảng Cáo Tìm Kiếm",
    status: "running",
    img: "https://picsum.photos/100/100?random=30",
    budget: "Không giới hạn",
    spent: "50.000đ",
    clicks: 45
  },
  {
    id: "AD002",
    name: "Đẩy mạnh Tai Nghe Bluetooth",
    type: "Quảng Cáo Khám Phá",
    status: "paused",
    img: "https://picsum.photos/100/100?random=31",
    budget: "100.000đ/ngày",
    spent: "25.500đ",
    clicks: 22
  },
  {
    id: "AD003",
    name: "Xả Kho Balo Laptop",
    type: "Quảng Cáo Tìm Kiếm",
    status: "ended",
    img: "https://picsum.photos/100/100?random=32",
    budget: "500.000đ",
    spent: "500.000đ",
    clicks: 410
  }
];

let currentTab = 'all';
let searchQuery = '';

// --- CHỨC NĂNG TẠO CHIẾN DỊCH MỚI ---
function openCreateModal() {
  document.getElementById('createAdModal').classList.add('show');
}

function closeCreateModal() {
  document.getElementById('createAdModal').classList.remove('show');
}

function createNewCampaign() {
  const name = document.getElementById('newAdName').value.trim();
  const type = document.getElementById('newAdType').value;
  const budget = document.getElementById('newAdBudget').value.trim();

  if(!name || !budget) {
      alert("Vui lòng nhập đầy đủ Tên chiến dịch và Ngân sách!");
      return;
  }

  // Sinh mã ngẫu nhiên VD: AD084
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  const newAd = {
      id: "AD" + randomNum,
      name: name,
      type: type,
      status: 'running',
      img: "https://picsum.photos/100/100?random=" + randomNum,
      budget: budget,
      spent: "0đ",
      clicks: 0
  };

  // Đưa chiến dịch mới lên đầu danh sách
  adCampaigns.unshift(newAd); 
  
  // Reset form & đóng cửa sổ
  document.getElementById('newAdName').value = '';
  document.getElementById('newAdBudget').value = '';
  closeCreateModal();

  updateStats();
  renderAds();
  alert("Tạo chiến dịch quảng cáo thành công!");
}

// Cập nhật số liệu trên thẻ thống kê đầu trang
function updateStats() {
  const runningCount = adCampaigns.filter(a => a.status === 'running').length;
  document.getElementById('activeAdCount').innerText = runningCount;
}

// --- CHỨC NĂNG BẬT/TẮT CHIẾN DỊCH ---
function toggleAdStatus(adId, checkbox) {
  const adIndex = adCampaigns.findIndex(ad => ad.id === adId);
  if (adIndex > -1) {
    if (adCampaigns[adIndex].status === 'ended') {
      alert("Chiến dịch này đã kết thúc, không thể bật lại.");
      checkbox.checked = false;
      return;
    }
    adCampaigns[adIndex].status = checkbox.checked ? 'running' : 'paused';
    updateStats();
    renderAds(); 
  }
}

// --- RENDER GIAO DIỆN ---
function renderAds() {
  const container = document.getElementById('adListContainer');
  container.innerHTML = ''; 

  const filteredAds = adCampaigns.filter(ad => {
    const matchTab = (currentTab === 'all') || (ad.status === currentTab);
    const keyword = searchQuery.toLowerCase().trim();
    // Đã thêm chức năng tìm kiếm bằng mã chiến dịch (ad.id)
    const matchSearch = ad.id.toLowerCase().includes(keyword) ||
                        ad.name.toLowerCase().includes(keyword) || 
                        ad.type.toLowerCase().includes(keyword);
    return matchTab && matchSearch;
  });

  if (filteredAds.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 50px; color: #888;">Không tìm thấy chiến dịch quảng cáo nào.</div>`;
    return;
  }

  const html = filteredAds.map(ad => {
    let statusLabel = "";
    let statusClass = "";
    let isChecked = "";
    let disabled = "";

    if (ad.status === 'running') { statusLabel = "Đang chạy"; statusClass = "status-running"; isChecked = "checked"; }
    else if (ad.status === 'paused') { statusLabel = "Tạm dừng"; statusClass = "status-paused"; }
    else if (ad.status === 'ended') { statusLabel = "Đã kết thúc"; statusClass = "status-ended"; disabled = "disabled"; }

    return `
    <div class="order-card">
      <div class="ad-info">
        <img src="${ad.img}" class="product-img" />
        <div>
          <div class="ad-id">Mã QC: ${ad.id}</div>
          <div class="ad-name">${ad.name}</div>
          <div class="ad-type">${ad.type}</div>
        </div>
      </div>
      
      <div class="ad-stats">
        <div class="ad-stat-item">Ngân sách <strong>${ad.budget}</strong></div>
        <div class="ad-stat-item">Chi phí <strong>${ad.spent}</strong></div>
        <div class="ad-stat-item">Số Click <strong>${ad.clicks}</strong></div>
      </div>

      <div style="display:flex; align-items:center; gap: 15px;">
        <span class="status-text ${statusClass}">${statusLabel}</span>
        <label class="switch">
          <input type="checkbox" ${isChecked} ${disabled} onchange="toggleAdStatus('${ad.id}', this)">
          <span class="slider"></span>
        </label>
      </div>
    </div>
  `}).join('');

  container.innerHTML = html;
}

// Xử lý Tabs
document.querySelectorAll('.tab-item').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    currentTab = this.getAttribute('data-status');
    renderAds();
  });
});

// Xử lý Tìm Kiếm
document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderAds();
});

document.getElementById('searchBtn').addEventListener('click', () => {
  searchQuery = document.getElementById('searchInput').value;
  renderAds();
});

document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderAds();
});