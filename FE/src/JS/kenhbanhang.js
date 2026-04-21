// Quản lý việc đóng/mở (Accordion) của menu Sidebar
function toggleMenu(element) {
    const section = element.parentElement;
    const icon = element.querySelector('.toggle-icon');

    if (section.classList.contains('expanded')) {
        section.classList.remove('expanded');
        icon.innerText = '˅';
    } else {
        section.classList.add('expanded');
        icon.innerText = '˄';
    }
}

const formatCurrency = (number) => {
  return new Intl.NumberFormat('vi-VN').format(number) + ' ₫';
};

const getCurrentUser = () => JSON.parse(localStorage.getItem('user') || 'null');

const isSellerUser = (user) => {
  if (!user) return false;
  const role = String(user.role || '').trim().toLowerCase();
  return role === 'seller' || role === '2' || role.includes('bán');
};


const loadDashboardStats = () => {
  const stats = JSON.parse(localStorage.getItem('dashboardOrderStats') || '{}');
  return {
    pending: stats.pending || 0,
    shipping: stats.shipping || 0,
    cancelled: stats.cancelled || 0,
    returnPending: stats.returnPending || 0,
    revenue: stats.revenue || 0,
    totalOrders: stats.totalOrders || 0,
    refunds: stats.refunds || 0,
  };
};

const renderDashboardCounts = () => {
  const stats = loadDashboardStats();
  const els = {
    countPending: stats.pending,
    countShipping: stats.shipping,
    countCancelled: stats.cancelled,
    countReturnPending: stats.returnPending,
    analyticsRevenue: formatCurrency(stats.revenue),
    analyticsTotalOrders: stats.totalOrders,
    analyticsRefunds: stats.refunds
  };

  for (const [id, value] of Object.entries(els)) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  }
};

// Xử lý logic click chọn trạng thái active cho menu con
document.addEventListener('DOMContentLoaded', () => {
    const subMenuItems = document.querySelectorAll('.sub-menu-item');
    
    subMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            subMenuItems.forEach(el => el.classList.remove('active'));
            this.classList.add('active');
        });
    });

    renderDashboardCounts();
});