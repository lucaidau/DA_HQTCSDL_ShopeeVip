 // Thêm đoạn này vào đầu script
let itemsToDelete = []; 
const modal = document.getElementById('delete-modal');
const modalMsg = document.getElementById('modal-message');
        // Hàm đổi số lượng
        function changeQty(id, delta) {
            const input = document.getElementById(id);
            let val = parseInt(input.value);
            val += delta;
            if (val < 1) val = 1;
            input.value = val;
        }

        // Dữ liệu mẫu sản phẩm gợi ý
        const sampleProducts = [
            { name: "Kem Chống Nắng Skin1004 Madagascar Centella", price: "285.000", img: "21" },
            { name: "Nước Tẩy Trang L'Oreal Paris 3-in-1 Micellar", price: "159.000", img: "22" },
            { name: "Sữa Rửa Mặt Cerave Foaming Facial Cleanser", price: "320.000", img: "23" },
            { name: "Mặt Nạ Ngủ Môi Laneige Lip Sleeping Mask", price: "45.000", img: "24" },
            { name: "Serum The Ordinary Niacinamide 10% + Zinc 1%", price: "185.000", img: "25" },
            { name: "Phấn Phủ Bột Kiềm Dầu Innisfree No Sebum", price: "99.000", img: "26" }
        ];

        const grid = document.getElementById('product-grid');
        const loading = document.getElementById('loading');

function createProductHTML(p) {
    const randomId = 'qty_' + Math.random().toString(36).substr(2, 9);
    // Chuyển "285.000" thành số 285000
    const numericPrice = parseInt(p.price.replace(/\./g, ''));

    return `
    <div class="shop-section">
        <div class="shop-header">
            <input type="checkbox" class="shop-checkbox"> 
            <span class="badge-yeuthich">Gợi ý</span>
            <strong>Cửa hàng của ${p.name.split(' ')[0]}</strong>
            <i class="fa-solid fa-comment-dots" style="color: var(--shopee-orange);"></i>
        </div>
        <div class="cart-item">
            <input type="checkbox" class="item-checkbox" data-price="${numericPrice}">
            <div class="item-info">
                <img src="https://picsum.photos/100/100?random=${p.img}" alt="product">
                <div>
                    <div class="item-name">${p.name}</div>
                    <div class="item-variant">Phân loại hàng: Mặc định <i class="fa-solid fa-caret-down"></i></div>
                </div>
            </div>
            <div style="text-align: center;">₫${p.price}</div>
            <div style="display: flex; justify-content: center;">
                <div class="quantity-control">
                    <button class="btn-qty" data-target="${randomId}" data-delta="-1">-</button>
                    <input type="text" id="${randomId}" class="qty-input" value="1" readonly>
                    <button class="btn-qty" data-target="${randomId}" data-delta="1">+</button>
                </div>
            </div>
            <div style="text-align: center;" class="price-subtotal">₫${p.price}</div>
            <div style="text-align: center;">
                <button class="btn-delete">Xóa</button>
            </div>
        </div>
    </div>
    `;
}

        // Hàm tải thêm sản phẩm
        function loadMore() {
            loading.style.display = 'block';
            
            // Giả lập gọi API mất 1 giây
            setTimeout(() => {
                let html = "";
                // Thêm 12 sản phẩm mỗi lần cuộn
                for(let i=0; i<12; i++) {
                    const p = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
                    html += createProductHTML(p);
                }
                grid.insertAdjacentHTML('beforeend', html);
                loading.style.display = 'none';
            }, 1000);
        }

        // Sử dụng Intersection Observer để phát hiện cuộn đến cuối trang
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        }, { threshold: 0.1 });

        observer.observe(document.getElementById('scroll-marker'));
// Cập nhật lại hàm updateTotal cho chính xác
function updateTotal() {
    let totalItems = 0;
    let totalPrice = 0;
    
    const selectedItems = document.querySelectorAll('.item-checkbox:checked');
    
    selectedItems.forEach(checkbox => {
        const cartItem = checkbox.closest('.cart-item');
        const price = parseInt(checkbox.getAttribute('data-price'));
        const qtyInput = cartItem.querySelector('.qty-input');
        const qty = parseInt(qtyInput.value);
        
        totalItems += qty;
        totalPrice += price * qty;
    });

    const footer = document.querySelector('.footer-checkout');
    // Cập nhật số tiền
    footer.querySelector('.total-amount span').innerText = `₫${totalPrice.toLocaleString('vi-VN')}`;
    // Cập nhật số lượng ở nút chọn tất cả
    footer.querySelector('.checkout-left label').innerText = `Chọn Tất Cả (${totalItems})`;
    // Cập nhật dòng tổng thanh toán
    footer.querySelector('.total-amount div:first-child').innerHTML = `Tổng thanh toán (${selectedItems.length} sản phẩm): <span>${totalPrice.toLocaleString('vi-VN')}₫</span>`;
}

// Lắng nghe sự kiện click trên toàn bộ danh sách sản phẩm (Event Delegation)
grid.addEventListener('change', function(e) {
    // 1. Nếu nhấn vào checkbox của SHOP
    if (e.target.classList.contains('shop-checkbox')) {
        const shopSection = e.target.closest('.shop-section');
        const itemCheckboxes = shopSection.querySelectorAll('.item-checkbox');
        itemCheckboxes.forEach(cb => cb.checked = e.target.checked);
        updateTotal();
    }
    
    // 2. Nếu nhấn vào checkbox của SẢN PHẨM
    if (e.target.classList.contains('item-checkbox')) {
        const shopSection = e.target.closest('.shop-section');
        const shopCheckbox = shopSection.querySelector('.shop-checkbox');
        const allItems = shopSection.querySelectorAll('.item-checkbox');
        const checkedItems = shopSection.querySelectorAll('.item-checkbox:checked');
        
        // Tự động tích/bỏ tích shop checkbox nếu tất cả sản phẩm con được chọn
        shopCheckbox.checked = (allItems.length === checkedItems.length);
        updateTotal();
    }
});

// Lắng nghe nút tăng giảm số lượng
grid.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-qty')) {
        const inputId = e.target.getAttribute('data-target');
        const delta = parseInt(e.target.getAttribute('data-delta'));
        const input = document.getElementById(inputId);
        
        let val = parseInt(input.value) + delta;
        if (val < 1) val = 1;
        input.value = val;
        
        // Cập nhật lại thành tiền của dòng đó (Subtotal)
        const cartItem = e.target.closest('.cart-item');
        const price = parseInt(cartItem.querySelector('.item-checkbox').getAttribute('data-price'));
        cartItem.querySelector('.price-subtotal').innerText = `₫${(price * val).toLocaleString('vi-VN')}`;
        
        updateTotal();
    }
    // THÊM ĐOẠN NÀY: Xử lý nút Xóa từng dòng
    if (e.target.classList.contains('btn-delete')) {
        const shopSection = e.target.closest('.shop-section');
        itemsToDelete = [shopSection]; // Lưu lại hàng cần xóa
        modalMsg.innerText = "Bạn có muốn bỏ 1 sản phẩm?";
        modal.style.display = 'flex'; // Hiện modal
    }
});

// Xử lý nút "Chọn tất cả" ở dưới Footer
document.getElementById('check-all-footer').addEventListener('change', function(e) {
    const allCheckboxes = document.querySelectorAll('.shop-checkbox, .item-checkbox');
    allCheckboxes.forEach(cb => cb.checked = e.target.checked);
    updateTotal();
});
// Nút TRỞ LẠI
document.getElementById('btn-cancel').addEventListener('click', () => {
    modal.style.display = 'none';
    itemsToDelete = [];
});

// Nút CÓ (Thực hiện xóa)
document.getElementById('btn-confirm').addEventListener('click', () => {
    itemsToDelete.forEach(item => {
        item.remove(); // Xóa khỏi giao diện
    });
    
    modal.style.display = 'none';
    itemsToDelete = [];
    updateTotal(); // Tính lại tổng tiền sau khi xóa
});
// Thêm đoạn này vào bất kỳ đâu trong script
document.querySelector('.checkout-left .btn-delete').addEventListener('click', function() {
    const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
    
    if (selectedCheckboxes.length > 0) {
        // Lấy tất cả các shop-section của các sản phẩm đã chọn
        itemsToDelete = Array.from(selectedCheckboxes).map(cb => cb.closest('.shop-section'));
        modalMsg.innerText = `Bạn có muốn bỏ ${selectedCheckboxes.length} sản phẩm?`;
        modal.style.display = 'flex';
    } else {
        alert("Vui lòng chọn sản phẩm để xóa!");
    }
});
        // Tải lần đầu
        loadMore();