/**
 * 商品详情页逻辑
 */
const ProductPage = (() => {
  // 当前商品数据
  let product = null;
  // 已选规格
  let selectedSpecs = {};
  // 购买数量
  let quantity = 1;
  // 当前缩略图索引
  let currentThumbIndex = 0;

  // 分类名称映射
  const catNames = {
    1: '手机数码', 2: '电脑办公', 3: '家用电器', 4: '服饰鞋包',
    5: '美妆护肤', 6: '食品生鲜', 7: '运动户外', 8: '图书文具'
  };

  // 模拟用户评价数据
  const mockReviews = [
    { user: '张**', avatar: '👩', rating: 5, date: '2026-05-28', text: '质量非常好，物流也快，包装完好无损，非常满意的一次购物！' },
    { user: '李**', avatar: '👨', rating: 4, date: '2026-05-25', text: '性价比很高，用了几天感觉不错，推荐购买。' },
    { user: '王**', avatar: '👩', rating: 5, date: '2026-05-20', text: '第二次购买了，品质一如既往的好，好评！' },
    { user: '赵**', avatar: '👨', rating: 4, date: '2026-05-18', text: '包装精美，商品和描述一致，客服态度也很好。' },
    { user: '陈**', avatar: '👩', rating: 5, date: '2026-05-15', text: '非常满意，已经推荐给朋友了。' }
  ];

  // 渲染商品详情页
  async function render() {
    const container = document.getElementById('productDetail');
    const id = Common.getParam('id');

    if (!id) {
      container.innerHTML = '<div class="empty-state"><h3>商品不存在</h3><a href="../index.html" class="btn btn-primary">返回首页</a></div>';
      return;
    }

    product = await API.getProduct(id);
    if (!product) {
      container.innerHTML = '<div class="empty-state"><h3>商品不存在或已下架</h3><a href="../index.html" class="btn btn-primary">返回首页</a></div>';
      return;
    }

    // 更新页面标题
    document.title = `${product.name} - 优品商城`;

    // 更新面包屑导航
    document.getElementById('breadcrumbCategory').textContent = catNames[product.category] || '商品详情';

    // 初始化选中的规格
    product.specs.forEach(spec => {
      selectedSpecs[spec.name] = spec.options[0];
    });

    const discount = Math.round((1 - product.price / product.originalPrice) * 100);

    container.innerHTML = `
      <div class="product-top">
        <!-- 商品图片区域 -->
        <div class="product-gallery">
          <div class="gallery-main" id="galleryMain"><img src="${product.images[0] || product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px"></div>
          <div class="gallery-thumbs">
            ${product.images.map((img, i) => `
              <div class="thumb ${i === 0 ? 'active' : ''}" onclick="ProductPage.switchThumb(${i})"><img src="${img}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"></div>
            `).join('')}
          </div>
        </div>

        <!-- 商品信息区域 -->
        <div class="product-info-section">
          <h1 class="product-title">${product.name}</h1>
          <p class="product-subtitle">${product.description}</p>

          <!-- 价格区域 -->
          <div class="price-section">
            <div class="price-row">
              <span class="label">价格</span>
              <span class="current-price">${product.price.toFixed(2)}</span>
              <span class="original-price">¥${product.originalPrice.toFixed(2)}</span>
              <span class="discount-tag">-${discount}%</span>
            </div>
          </div>

          <!-- 规格选择区域 -->
          <div class="spec-section">
            ${product.specs.map(spec => `
              <div class="spec-row">
                <span class="label">${spec.name}</span>
                <div class="spec-options" data-spec="${spec.name}">
                  ${spec.options.map(opt => `
                    <span class="spec-option ${selectedSpecs[spec.name] === opt ? 'active' : ''}"
                          onclick="ProductPage.selectSpec('${spec.name}', '${opt}', this)">${opt}</span>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- 数量选择区域 -->
          <div class="quantity-section">
            <span class="label">数量</span>
            <div class="quantity-control">
              <button onclick="ProductPage.changeQty(-1)">−</button>
              <input type="number" id="qtyInput" value="1" min="1" max="${product.stock}" onchange="ProductPage.setQty(this.value)">
              <button onclick="ProductPage.changeQty(1)">+</button>
            </div>
            <span class="stock-info">库存 ${product.stock} 件</span>
          </div>

          <!-- 操作按钮区域 -->
          <div class="product-actions">
            <button class="btn btn-add-cart" onclick="ProductPage.addToCart()">🛒 加入购物车</button>
            <button class="btn btn-primary" onclick="ProductPage.buyNow()">⚡ 立即购买</button>
          </div>

          <!-- 商品元信息 -->
          <div class="product-meta-info">
            <span>⭐ ${product.rating} 分</span>
            <span>📦 已售 ${product.sales > 10000 ? (product.sales / 10000).toFixed(1) + '万' : product.sales}</span>
            <span>🏪 优品自营</span>
            <span>🚚 免费配送</span>
          </div>
        </div>
      </div>

      <!-- 商品详情标签页 -->
      <div class="product-tabs">
        <div class="tab-header">
          <button class="active" onclick="ProductPage.switchTab('detail', this)">商品详情</button>
          <button onclick="ProductPage.switchTab('reviews', this)">用户评价 (${mockReviews.length})</button>
        </div>
        <div class="tab-content active" id="tabDetail">
          <div class="detail-text">${product.detail}</div>
        </div>
        <div class="tab-content" id="tabReviews">
          ${mockReviews.map(r => `
            <div class="review-item">
              <div class="review-header">
                <span class="review-avatar">${r.avatar}</span>
                <span class="review-user">${r.user}</span>
                <span class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                <span class="review-date">${r.date}</span>
              </div>
              <p class="review-text">${r.text}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 切换缩略图
  function switchThumb(index) {
    currentThumbIndex = index;
    const img = product.images[index];
    document.getElementById('galleryMain').innerHTML = `<img src="${img}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`;
    document.querySelectorAll('.gallery-thumbs .thumb').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
  }

  // 选择规格
  function selectSpec(specName, value, el) {
    selectedSpecs[specName] = value;
    const parent = el.closest('.spec-options');
    parent.querySelectorAll('.spec-option').forEach(opt => opt.classList.remove('active'));
    el.classList.add('active');
  }

  // 修改购买数量
  function changeQty(delta) {
    const input = document.getElementById('qtyInput');
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (val > product.stock) val = product.stock;
    input.value = val;
    quantity = val;
  }

  // 设置购买数量
  function setQty(val) {
    let v = parseInt(val);
    if (isNaN(v) || v < 1) v = 1;
    if (v > product.stock) v = product.stock;
    document.getElementById('qtyInput').value = v;
    quantity = v;
  }

  // 添加到购物车
  async function addToCart() {
    if (!product) return;
    try {
      await API.addToCart(product.id, selectedSpecs, quantity);
      Common.toast('已加入购物车');
      Common.updateCartBadge();
    } catch (err) {
      Common.toast(err.message, 'error');
    }
  }

  // 立即购买
  async function buyNow() {
    if (!product) return;
    const user = API.getCurrentUser();
    if (!user) {
      Common.toast('请先登录', 'info');
      setTimeout(() => location.href = 'login.html?redirect=' + encodeURIComponent(location.href), 800);
      return;
    }
    await addToCart();
    location.href = 'cart.html';
  }

  // 切换标签页
  function switchTab(tabName, btn) {
    document.querySelectorAll('.tab-header button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabName === 'detail' ? 'tabDetail' : 'tabReviews').classList.add('active');
  }

  // 初始化页面
  function init() {
    Common.initPage();
    render();
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);

  // 返回公共接口
  return { switchThumb, selectSpec, changeQty, setQty, addToCart, buyNow, switchTab };
})();
