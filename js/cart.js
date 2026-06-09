/**
 * 购物车页面逻辑
 */
const CartPage = (() => {
  // 购物车数据
  let cart = [];

  // 渲染购物车页面
  function render() {
    cart = API.getCart();
    const container = document.getElementById('cartPage');

    // 购物车为空时显示提示
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3>购物车空空如也</h3>
          <p>快去挑选心仪的商品吧</p>
          <a href="../index.html" class="btn btn-primary">去逛逛</a>
        </div>
      `;
      return;
    }

    const allChecked = cart.every(item => item.checked);

    container.innerHTML = `
      <!-- 购物车表头 -->
      <div class="cart-header">
        <label><input type="checkbox" id="selectAll" ${allChecked ? 'checked' : ''} onchange="CartPage.toggleAll(this.checked)"> 全选</label>
        <span>商品信息</span>
        <span>单价</span>
        <span>数量</span>
        <span>小计</span>
        <span>操作</span>
      </div>

      <!-- 购物车商品列表 -->
      ${cart.map(item => {
      const imgSrc = item.image && item.image.startsWith('images/') ? item.image : `images/${item.productId % 26 || 26}.png`;
      return `
        <div class="cart-item" data-id="${item.id}">
          <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="CartPage.toggleItem(${item.id}, this.checked)">
          <div class="item-product">
            <div class="item-img" onclick="location.href='product.html?id=${item.productId}'"><img src="${imgSrc}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"></div>
            <div class="item-info">
              <div class="item-name" onclick="location.href='product.html?id=${item.productId}'">${item.name}</div>
              <div class="item-spec">${item.spec ? Object.entries(item.spec).map(([k, v]) => `${k}：${v}`).join('；') : ''}</div>
            </div>
          </div>
          <div class="item-price">¥${Common.formatPrice(item.price)}</div>
          <div class="item-quantity">
            <div class="quantity-control">
              <button onclick="CartPage.changeQty(${item.id}, -1)">−</button>
              <input type="number" value="${item.quantity}" min="1" onchange="CartPage.setQty(${item.id}, this.value)">
              <button onclick="CartPage.changeQty(${item.id}, 1)">+</button>
            </div>
          </div>
          <div class="item-subtotal">${(item.price * item.quantity).toFixed(2)}</div>
          <div class="item-action">
            <button onclick="CartPage.removeItem(${item.id})">删除</button>
          </div>
        </div>
      `}).join('')}

      <!-- 购物车底部操作栏 -->
      <div class="cart-footer">
        <div class="cart-footer-left">
          <label><input type="checkbox" id="selectAllBottom" ${allChecked ? 'checked' : ''} onchange="CartPage.toggleAll(this.checked)"> 全选</label>
          <span class="selected-count" id="selectedCount">已选 ${cart.filter(i => i.checked).length} 件</span>
          <button class="clear-cart" onclick="CartPage.clearAll()">清空购物车</button>
        </div>
        <div class="cart-footer-right">
          <div class="cart-total">
            合计：<span class="total-price" id="totalPrice">${API.getCartTotal().toFixed(2)}</span>
          </div>
          <button class="btn btn-primary btn-checkout" id="checkoutBtn"
                  onclick="CartPage.goCheckout()"
                  ${cart.filter(i => i.checked).length === 0 ? 'disabled' : ''}>
            去结算 (${cart.filter(i => i.checked).length})
          </button>
        </div>
      </div>
    `;
  }

  // 切换全选状态
  function toggleAll(checked) {
    cart = API.getCart();
    cart.forEach(item => item.checked = checked);
    localStorage.setItem('shop_cart', JSON.stringify(cart));
    render();
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  // 切换单个商品选中状态
  function toggleItem(itemId, checked) {
    API.updateCartItem(itemId, { checked });
    render();
  }

  // 修改商品数量
  function changeQty(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    let qty = item.quantity + delta;
    if (qty < 1) qty = 1;
    API.updateCartItem(itemId, { quantity: qty });
    render();
    Common.updateCartBadge();
  }

  // 设置商品数量
  function setQty(itemId, val) {
    let qty = parseInt(val);
    if (isNaN(qty) || qty < 1) qty = 1;
    API.updateCartItem(itemId, { quantity: qty });
    render();
    Common.updateCartBadge();
  }

  // 移除商品
  function removeItem(itemId) {
    if (confirm('确定要删除这件商品吗？')) {
      API.removeCartItem(itemId);
      render();
      Common.updateCartBadge();
      Common.toast('已删除');
    }
  }

  // 清空购物车
  function clearAll() {
    if (confirm('确定要清空购物车吗？')) {
      API.clearCart();
      render();
      Common.updateCartBadge();
      Common.toast('购物车已清空');
    }
  }

  // 去结算
  function goCheckout() {
    const user = API.getCurrentUser();
    if (!user) {
      Common.toast('请先登录', 'info');
      setTimeout(() => location.href = 'login.html?redirect=cart.html', 800);
      return;
    }
    const checked = cart.filter(i => i.checked);
    if (checked.length === 0) {
      Common.toast('请至少选择一件商品', 'error');
      return;
    }
    location.href = 'checkout.html';
  }

  // 初始化页面
  function init() {
    Common.initPage();
    render();
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);

  // 返回公共接口
  return { toggleAll, toggleItem, changeQty, setQty, removeItem, clearAll, goCheckout };
})();
