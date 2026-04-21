// Dữ liệu mô phỏng biến động số dư
let transactions = [
  {
    id: "IN-240415AABBCC1",
    date: "15-04-2026 14:30",
    type: "in",
    desc: "Doanh thu từ đơn hàng 240415AABBCC1",
    amount: 2000000,
    status: "success",
    statusText: "Thành công"
  },
  {
    id: "IN-240414XYZ987",
    date: "14-04-2026 09:15",
    type: "in",
    desc: "Doanh thu từ đơn hàng 240414XYZ987",
    amount: 2500000,
    status: "success",
    statusText: "Thành công"
  },
  {
    id: "OUT-WITHDRAW001",
    date: "12-04-2026 08:00",
    type: "out",
    desc: "Rút tiền về Vietcombank (*1234)",
    amount: 1000000,
    status: "success",
    statusText: "Thành công"
  }
];

let currentTab = 'all';
let searchQuery = '';
let currentBalanceNum = 0;

// Format tiền tệ
function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN').format(number) + ' ₫';
}

// Tự động tính toán số dư
function calculateBalance() {
    let totalIn = 0;
    let totalOut = 0;

    transactions.forEach(t => {
        if (t.type === 'in' && t.status === 'success') {
            totalIn += t.amount;
        } else if (t.type === 'out') {
            totalOut += t.amount; // Cả success và processing đều trừ tiền
        }
    });

    currentBalanceNum = totalIn - totalOut;
    document.getElementById('currentBalance').innerText = formatCurrency(currentBalanceNum);
    document.getElementById('availableToWithdraw').innerText = formatCurrency(currentBalanceNum);
}

// Render bảng lịch sử
function renderTransactions() {
  const tbody = document.getElementById('transactionList');
  const noDataMsg = document.getElementById('noDataMessage');
  tbody.innerHTML = '';

  const filtered = transactions.filter(t => {
    const matchTab = (currentTab === 'all') || (t.type === currentTab);
    const matchSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  if (filtered.length === 0) {
    noDataMsg.style.display = 'block';
  } else {
    noDataMsg.style.display = 'none';
    const html = filtered.map(t => {
      const amountClass = t.type === 'in' ? 'amount-in' : 'amount-out';
      const sign = t.type === 'in' ? '+' : '-';
      const formattedAmount = sign + formatCurrency(t.amount);
      const statusClass = t.status === 'success' ? 'status-success' : 'status-processing';
      
      return `
        <tr>
          <td style="color:#666;">${t.date}</td>
          <td style="font-weight: 500;">${t.id}</td>
          <td>${t.desc}</td>
          <td class="${amountClass}">${formattedAmount}</td>
          <td><span class="status-label ${statusClass}">${t.statusText}</span></td>
          <td><a class="action-link" onclick="viewDetail('${t.id}')">Xem</a></td>
        </tr>
      `;
    }).join('');
    tbody.innerHTML = html;
  }
}

// Chức năng RÚT TIỀN
function openWithdrawModal() {
    if (currentBalanceNum <= 0) {
        alert("Số dư của bạn không đủ để rút tiền.");
        return;
    }
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawModal').classList.add('show');
}

function closeWithdrawModal() {
    document.getElementById('withdrawModal').classList.remove('show');
}

function processWithdraw() {
    const inputVal = document.getElementById('withdrawAmount').value;
    const amountToWithdraw = parseInt(inputVal, 10);

    if (!amountToWithdraw || isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ!");
        return;
    }
    if (amountToWithdraw > currentBalanceNum) {
        alert("Số tiền rút không được vượt quá số dư khả dụng!");
        return;
    }

    // Tạo mã ngẫu nhiên cho giao dịch
    const randomID = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    // Thêm giao dịch rút tiền mới lên đầu mảng
    transactions.unshift({
        id: "OUT-REQ" + randomID,
        date: "Vừa xong",
        type: "out",
        desc: "Rút tiền về Vietcombank",
        amount: amountToWithdraw,
        status: "success",
        statusText: "Thành công"
    });

    closeWithdrawModal();
    alert("Rút tiền thành công! Số dư đã được cập nhật.");
    
    // Chuyển sang tab Tiền Ra để thấy luôn
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-type="out"]').classList.add('active');
    currentTab = 'out';

    calculateBalance();
    renderTransactions();
}

// Chi tiết giao dịch
function viewDetail(id) {
    const t = transactions.find(x => x.id === id);
    if(!t) return;
    
    const sign = t.type === 'in' ? '+' : '-';
    const content = `
        <p><strong>Mã GD:</strong> ${t.id}</p>
        <p><strong>Loại:</strong> ${t.type === 'in' ? 'Tiền vào' : 'Tiền ra'}</p>
        <p><strong>Thời gian:</strong> ${t.date}</p>
        <p><strong>Nội dung:</strong> ${t.desc}</p>
        <hr style="margin: 15px 0; border:0; border-top: 1px dashed #ccc;">
        <div style="display:flex; justify-content:space-between; font-size: 18px; font-weight: bold;">
            <span>Số tiền:</span>
            <span style="color: ${t.type === 'in' ? '#4caf50' : '#f44336'}">${sign}${formatCurrency(t.amount)}</span>
        </div>
    `;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('infoModal').classList.add('show');
}

function closeInfoModal() {
    document.getElementById('infoModal').classList.remove('show');
}

// Tabs & Filter Event Listeners
document.querySelectorAll('.tab-item').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    currentTab = this.getAttribute('data-type');
    renderTransactions();
  });
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderTransactions();
});

document.getElementById('searchBtn').addEventListener('click', () => {
  searchQuery = document.getElementById('searchInput').value;
  renderTransactions();
});

// Khởi chạy khi load
document.addEventListener('DOMContentLoaded', () => {
    calculateBalance();
    renderTransactions();
});