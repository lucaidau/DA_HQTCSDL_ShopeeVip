 // ============================================================
        // CART LOGIC
        // ============================================================
        let cartCount = 3; // starting count shown in badge
        let toastTimer = null;

        function updateCartBadge(count) {
            const badge = document.querySelector('.cart-badge');
            if (!badge) return;
            badge.textContent = count > 99 ? '99+' : count;
            // Animate badge
            badge.style.transform = 'scale(1.5)';
            badge.style.transition = 'transform 0.2s ease';
            setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
        }

        function showToast(qty) {
            const toast = document.getElementById('cartToast');
            const sub = document.getElementById('toastSub');
            sub.textContent = qty + ' sản phẩm được thêm thành công.';
            toast.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => hideToast(), 3000);
        }

        function hideToast() {
            document.getElementById('cartToast').classList.remove('show');
        }

        function addToCart() {
            const qty = parseInt(document.getElementById('qtyInput').value) || 1;
            cartCount += qty;
            updateCartBadge(cartCount);
            showToast(qty);

            // Briefly animate the button
            const btn = document.querySelector('.btn-add-cart');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check" style="font-size:18px"></i> Đã Thêm Vào Giỏ!';
            btn.style.background = '#d4f5e2';
            btn.style.color = '#00865a';
            btn.style.borderColor = '#00865a';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }, 1800);
        }

        function buyNow() {
            addToCart();
        }

        // ============================================================
        // COLOR VARIANTS: each color key has its own image set
        // ============================================================
        const colorImages = {
            'xanh-dam': [
                'https://images.unsplash.com/photo-1542272604-787c3835535d',
                'https://images.unsplash.com/photo-1580402427914-a6cc60d7d44f',
                'https://images.unsplash.com/photo-1604176354204-9268737828e4',
                'https://images.unsplash.com/photo-1598522325074-042db73aa4e6',
                'https://images.unsplash.com/photo-1542272604-787c3835535d'
            ],
            'xanh-nhat': [
                'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
                'https://images.unsplash.com/photo-1582552938357-32b906df40cb',
                'https://images.unsplash.com/photo-1523381294911-8d3cead13475',
                'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2',
                'https://images.unsplash.com/photo-1541099649105-f69ad21f3246'
            ],
            'den': [
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
                'https://images.unsplash.com/photo-1516257984-b1b4d707412e',
                'https://images.unsplash.com/photo-1523381294911-8d3cead13475'
            ]
        };

        // Switch gallery when a color button is clicked
        function selectColor(btn) {
            if (btn.style.opacity === '0.4') return;
            // Deactivate all color buttons in same row
            btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const key = btn.dataset.colorKey;
            const imgs = colorImages[key];
            if (!imgs) return;

            // Update main image
            const mainImg = document.getElementById('mainImg');
            mainImg.style.opacity = '0';
            setTimeout(() => {
                mainImg.src = imgs[0] + '?w=450';
                mainImg.style.opacity = '1';
            }, 150);

            // Update thumbnails
            const thumbList = document.getElementById('thumbList');
            const thumbImgs = thumbList.querySelectorAll('.thumb-img');
            thumbImgs.forEach((thumb, i) => {
                thumb.classList.remove('active');
                if (imgs[i]) thumb.src = imgs[i] + '?w=82';
            });
            thumbImgs[0].classList.add('active');
        }

        // Add fade transition on main image
        document.getElementById('mainImg').style.transition = 'opacity 0.15s ease';

        // Hover thumbnail to change main image
        function changeImg(element) {
            document.querySelectorAll('.thumb-img').forEach(img => img.classList.remove('active'));
            element.classList.add('active');
            const mainImg = document.getElementById('mainImg');
            mainImg.style.opacity = '0';
            setTimeout(() => {
                mainImg.src = element.src.replace('w=82', 'w=450');
                mainImg.style.opacity = '1';
            }, 100);
        }

        // Size/other attribute selection
        function activateAttr(btn) {
            if (btn.style.opacity === '0.4') return;
            btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        // Quantity
        const qtyInput = document.getElementById('qtyInput');
        function updateQty(step) {
            let val = parseInt(qtyInput.value) || 1;
            val = Math.min(Math.max(val + step, 1), 1234);
            qtyInput.value = val;
        }
        qtyInput.addEventListener('input', () => {
            let val = parseInt(qtyInput.value);
            if (isNaN(val) || val < 1) qtyInput.value = 1;
            else if (val > 1234) qtyInput.value = 1234;
        });

        // ============================================================
        // RELATED PRODUCTS: 30-item pool, first 12 shown, rest expandable
        // ============================================================
        // Helper tạo mô tả ngẫu nhiên theo tên sản phẩm
        function makeDesc(title) {
            return `🌟 ${title}
- Chất liệu: Denim cao cấp, co giãn tốt, bền màu.
- Thiết kế hiện đại, phù hợp nhiều dịp: đi học, đi chơi, dạo phố.
- Size: S (Eo 60-64cm), M (Eo 65-68cm), L (Eo 69-73cm), XL (Eo 74-78cm).

📌 BẢO QUẢN:
- Giặt máy chế độ nhẹ hoặc giặt tay.
- Phơi bóng râm, không dùng thuốc tẩy.

🛡 ĐỔI TRẢ MIỄN PHÍ nếu lỗi sản xuất.`;
        }

        function poolItem(title, price, oldPrice, sold, rating, img, style, material, stock) {
            return { title, price, oldPrice, sold, rating, img, style: style || 'Ống suông rộng', material: material || 'Denim', stock: stock || Math.floor(Math.random() * 900 + 100), desc: makeDesc(title) };
        }

        const productPool = [
            poolItem("Quần Jeans Nữ Lưng Cao Form Rộng", "₫135.000", "₫220.000", "2,1k", 4.8, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300"),
            poolItem("Quần Bò Ống Rộng Nữ Xanh Basic", "₫149.000", "₫230.000", "5,3k", 4.9, "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300"),
            poolItem("Quần Jean Nữ Ống Loe Dáng Dài", "₫159.000", "₫260.000", "1,2k", 4.7, "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=300", "Ống loe"),
            poolItem("Quần Baggy Jeans Vintage Sành Điệu", "₫129.000", "₫200.000", "980", 4.6, "https://images.unsplash.com/photo-1623330188314-8f4645626731?w=300", "Baggy"),
            poolItem("Quần Short Jeans Nữ Rách Lai", "₫95.000", "₫165.000", "3,2k", 4.5, "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=300", "Short"),
            poolItem("Quần Bò Nam Ống Rộng Local Brand", "₫189.000", "₫310.000", "450", 4.7, "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=300"),
            poolItem("Quần Jeans Ống Suông Xanh Nhạt", "₫119.000", "₫180.000", "6,7k", 4.9, "https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=300"),
            poolItem("Quần Jean Nữ Đen Cạp Cao", "₫145.000", "₫240.000", "1,5k", 4.8, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300"),
            poolItem("Quần Jeans Nữ Cạp To Chun Mềm", "₫109.000", "₫190.000", "4,8k", 4.6, "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300"),
            poolItem("Quần Bò Nữ Xé Gối Ulzzang", "₫125.000", "₫210.000", "2,9k", 4.7, "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=300"),
            poolItem("Quần Jean Baggy Đen Nữ Trẻ Trung", "₫169.000", "₫290.000", "760", 4.5, "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300", "Baggy"),
            poolItem("Quần Jeans Nữ Ống Bó Cạp Cao Hàn", "₫115.000", "₫175.000", "3,4k", 4.8, "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=300", "Ống bó"),
            poolItem("Quần Bò 2 Màu Xanh Đậm Nhạt", "₫99.000", "₫155.000", "8,1k", 4.9, "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=300"),
            poolItem("Quần Jean Lưng Thun Co Giãn", "₫139.000", "₫220.000", "1,1k", 4.7, "https://images.unsplash.com/photo-1580402427914-a6cc60d7d44f?w=300"),
            poolItem("Quần Jeans Thêu Hoa Boho", "₫175.000", "₫280.000", "340", 4.6, "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=300"),
            poolItem("Quần Jeans Mài Bạc Ánh Kim", "₫199.000", "₫320.000", "520", 4.8, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300"),
            poolItem("Quần Short Jeans Nữ Rách Gối", "₫85.000", "₫140.000", "9,2k", 4.5, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300", "Short"),
            poolItem("Quần Bò Nam Skinny Cổ Điển", "₫155.000", "₫250.000", "670", 4.6, "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=300", "Skinny"),
            poolItem("Quần Jean Straight Leg Nữ", "₫165.000", "₫260.000", "1,8k", 4.7, "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300", "Straight"),
            poolItem("Quần Jeans Cạp Bản To HQ", "₫138.000", "₫220.000", "4,1k", 4.8, "https://images.unsplash.com/photo-1623330188314-8f4645626731?w=300"),
            poolItem("Quần Short Jeans Trắng Cá Tính", "₫89.000", "₫145.000", "2,3k", 4.5, "https://images.unsplash.com/photo-1482855549413-2a6c9b1955a7?w=300", "Short"),
            poolItem("Quần Jean Streetwear Thời Trang", "₫72.000", "₫120.000", "5,6k", 4.6, "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300"),
            poolItem("Quần Jeans Nam Slim Fit", "₫179.000", "₫290.000", "890", 4.7, "https://images.unsplash.com/photo-1516763296043-f676c1105999?w=300", "Slim Fit"),
            poolItem("Quần Jeans Nữ Phối Dây Khóa", "₫148.000", "₫240.000", "1,4k", 4.8, "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=300"),
            poolItem("Quần Jean Ống Rộng Cạp Thun", "₫109.000", "₫175.000", "3,7k", 4.6, "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300"),
            poolItem("Quần Bò Nữ Túi Hộp Ulzzang", "₫132.000", "₫210.000", "2,5k", 4.7, "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300"),
            poolItem("Quần Jeans Nam Baggy Wash", "₫195.000", "₫310.000", "610", 4.5, "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=300", "Baggy"),
            poolItem("Quần Short Jean Nữ Đầu Gối", "₫92.000", "₫150.000", "4,4k", 4.6, "https://images.unsplash.com/photo-1529720317453-c8da503f2051?w=300", "Short"),
            poolItem("Quần Jean Nữ Ống Đứng Tôn Dáng", "₫158.000", "₫250.000", "1,9k", 4.8, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300"),
            poolItem("Quần Jeans Patchwork Độc Lạ", "₫210.000", "₫340.000", "280", 4.7, "https://images.unsplash.com/photo-1561388689-ef0dbf994d3c?w=300")
        ];

        // ============================================================
        // RELATED PRODUCTS: Vô hạn - random từ pool, load thêm khi scroll
        // ============================================================
        function shuffle(arr) {
            return arr.slice().sort(() => Math.random() - 0.5);
        }

        function randItem() {
            // Pick one random item from pool
            return productPool[Math.floor(Math.random() * productPool.length)];
        }

        // Lưu shuffled array để có thể tra cứu index
        let shuffledPool = [];

        function makeCard(p, index) {
            const FALLBACK = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300';
            return `<a href="#" class="product-card" onclick="loadProduct(${index}); return false;">
                <img src="${p.img}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK}'">
                <div class="pc-info">
                    <div class="pc-title">${p.title}</div>
                    <div class="pc-price">
                        <span class="pc-price-val">${p.price}</span>
                        <span class="pc-sold">Đã bán ${p.sold}</span>
                    </div>
                </div>
            </a>`;
        }

        // ============================================================
        // LOAD PRODUCT: Cập nhật giao diện khi click sản phẩm gợi ý
        // ============================================================
        function renderStars(rating) {
            const full = Math.floor(rating);
            const half = rating % 1 >= 0.5 ? 1 : 0;
            const empty = 5 - full - half;
            let html = '';
            for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
            if (half) html += '<i class="fas fa-star-half-alt"></i>';
            for (let i = 0; i < empty; i++) html += '<i class="far fa-star"></i>';
            return html;
        }

        function calcDiscount(price, oldPrice) {
            const p = parseInt(price.replace(/[^đ\d]/g, '').replace('đ', ''));
            const o = parseInt(oldPrice.replace(/[^đ\d]/g, '').replace('đ', ''));
            if (!p || !o || o <= p) return null;
            return Math.round((1 - p / o) * 100) + '% GIẢM';
        }

        function loadProduct(index) {
            const p = shuffledPool[index];
            if (!p) return;

            // Fade out main image
            const mainImg = document.getElementById('mainImg');
            mainImg.style.opacity = '0';
            setTimeout(() => {
                mainImg.src = p.img.replace('?w=300', '?w=450');
                mainImg.style.opacity = '1';
            }, 150);

            // Update all 5 thumbnails to the same image (since we have 1 image per product)
            document.querySelectorAll('.thumb-img').forEach(t => {
                t.src = p.img.replace('?w=300', '?w=82');
                t.classList.remove('active');
            });
            document.querySelector('.thumb-img').classList.add('active');

            // Update text fields
            document.getElementById('prodTitle').textContent = p.title;
            document.getElementById('prodRating').textContent = p.rating;
            document.getElementById('prodStars').innerHTML = renderStars(p.rating);
            document.getElementById('prodSold').textContent = p.sold;
            document.getElementById('prodReviews').textContent = p.sold;
            document.getElementById('prodNewPrice').textContent = p.price;
            document.getElementById('prodOldPrice').textContent = p.oldPrice;
            document.getElementById('prodDesc').textContent = p.desc;
            document.getElementById('detailStyle').textContent = p.style;
            document.getElementById('detailMaterial').textContent = p.material;
            document.getElementById('detailStock').textContent = p.stock;

            // Update color options dynamically for this new product
            // We use p.img for all colors so it doesn't jump back to the old product
            const colorBtns = document.querySelectorAll('.btn-attr[data-color-key]');
            colorBtns.forEach(btn => {
                const key = btn.dataset.colorKey;
                // Update the icon inside the button
                const img = btn.querySelector('img');
                if (img) img.src = p.img.replace('?w=300', '?w=82');
                
                // Update the colorImages dictionary so it doesn't jump back to old product
                colorImages[key] = Array(5).fill(p.img);
            });
            // Auto click the first color button to make it active
            if(colorBtns.length > 0) {
                colorBtns.forEach(b => b.classList.remove('active'));
                colorBtns[0].classList.add('active');
            }

            // Update discount badge
            const disc = calcDiscount(p.price, p.oldPrice);
            const badge = document.getElementById('prodDiscount');
            badge.textContent = disc || '';
            badge.style.display = disc ? '' : 'none';

            // Reset quantity
            document.getElementById('qtyInput').value = 1;

            // Scroll to top of product section smoothly
            document.querySelector('.product-briefing').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        const relatedContainer = document.getElementById('relatedProducts');
        const sentinel = document.getElementById('scrollSentinel');
        let isLoading = false;

        function loadMoreProducts(count = 12) {
            if (isLoading) return;
            isLoading = true;
            sentinel.classList.add('visible');

            setTimeout(() => {
                for (let i = 0; i < count; i++) {
                    // Chọn random từ pool và lưu vào shuffledPool để index khớp
                    const item = productPool[Math.floor(Math.random() * productPool.length)];
                    const idx = shuffledPool.length;
                    shuffledPool.push(item);
                    relatedContainer.innerHTML += makeCard(item, idx);
                }
                sentinel.classList.remove('visible');
                isLoading = false;
            }, 400);
        }

        // Load initial 12
        loadMoreProducts(12);

        // IntersectionObserver: khi cuộn tới sentinel thì load thêm
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMoreProducts(12);
            }
        }, { rootMargin: '200px' });

        observer.observe(sentinel);