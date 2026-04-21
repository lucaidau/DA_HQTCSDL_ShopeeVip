/**
 * seller-header.js
 * Dùng chung cho tất cả trang Kênh Người Bán.
 * Đọc thông tin user từ localStorage (được lưu lúc đăng ký / đăng nhập)
 * và cập nhật tên + avatar trên header.
 */
(function () {
  const getCurrentUser = () => JSON.parse(localStorage.getItem('user') || 'null');

  const isSellerUser = (user) => {
    if (!user) return false;
    const role = String(user.role || '').trim().toLowerCase();
    return role === 'seller' || role === '2' || role.includes('bán');
  };

  const applyUserToHeader = () => {
    const user = getCurrentUser();

    // Chưa đăng nhập → về trang đăng nhập
    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    // Không phải seller → về trang chủ
    if (!isSellerUser(user)) {
      window.location.href = 'home.html';
      return;
    }

    // Lấy tên hiển thị: ưu tiên họ tên đầy đủ, rồi username
    const displayName = (user.name || user.username || user.userName || 'Người dùng').trim();

    // Cập nhật tên hiển thị trên header
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = displayName;
    });

    // Tạo avatar từ chữ cái đầu của displayName
    const avatarEl = document.querySelector('.user-avatar');
    if (avatarEl) {
      const initials = displayName
        .split(' ')
        .filter(Boolean)
        .map(word => word[0].toUpperCase())
        .slice(0, 2)
        .join('');
      avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=ee4d2d&color=fff&bold=true`;
      avatarEl.alt = displayName;
    }
  };

  // Chạy ngay khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUserToHeader);
  } else {
    applyUserToHeader();
  }
})();
