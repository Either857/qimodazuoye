/**
 * 订单页面逻辑 - 查看订单、支付待付款订单
 */
const OrderPage = (() => {
  // 订单数据
  let orders = [];
  // 当前筛选状态
  let currentFilter = 'all';
  // 正在支付的订单ID
  let payingOrderId = null;

  // 获取图片路径前缀
  const isInPages = location.pathname.includes('/pages/') || location.pathname.includes('\\pages\\');
  const imgPrefix = isInPages ? '../' : '';

  // 修复图片路径
  function fixImgPath(imgPath) {
    if (!imgPath) return '';
    if (imgPath.startsWith('http')) return imgPath;
    return imgPrefix + imgPath;
  }

  // 加载订单数据
  async function loadOrders() {
    const user = API.getCurrentUser();
    if (!user) {
      location.href = 'login.html?redirect=order.html';
      return;
    }

    orders = await API.getUserOrders();
    renderPage();
  }

  // 渲染订单页面
  function renderPage() {
    const container = document.getElementById('orderPage');
    const payOrderId = Common.getParam('pay');

    let html = '';

    // 如果刚创建订单，显示成功提示
    if (payOrderId) {
      const order = orders.find(o => o.id === payOrderId);
      if (order) {
        html += `
          <div class="order-success">
            <div class="success-icon">✅</div>
            <h2>订单提交成功！</h2>
            <p>订单号：${order.id}，应付金额：<strong style="color:var(--primary)">¥${Common.formatPrice(order.total)}</strong></p>
            <div class="success-actions">
              <button class="btn btn-primary" onclick="OrderPage.openPayModal('${order.id}')">立即支付</button>
              <a href="../index.html" class="btn btn-outline">继续购物</a>
            </div>
          </div>
        `;
      }
    }

    // 订单筛选标签
    const tabs = [
      { key: 'all', label: '全部订单' },
      { key: 'pending', label: '待付款' },
      { key: 'paid', label: '已付款' },
      { key: 'shipped', label: '已发货' },
      { key: 'completed', label: '已完成' }
    ];

    html += `
      <div class="order-tabs">
        ${tabs.map(t => `
          <div class="order-tab ${currentFilter === t.key ? 'active' : ''}"
               onclick="OrderPage.filterOrders('${t.key}')">${t.label}</div>
        `).join('')}
      </div>
    `;

    const filtered = currentFilter === 'all' ? orders : orders.filter(o => o.status === currentFilter);

    if (filtered.length === 0) {
      html += `
        <div class="empty-state" style="background:var(--white);border-radius:0 0 var(--radius-lg) var(--radius-lg);box-shadow:var(--shadow)">
          <div class="empty-icon">📦</div>
          <h3>暂无订单</h3>
          <p>${currentFilter === 'all' ? '快去选购心仪的商品吧' : '该状态下暂无订单'}</p>
          <a href="../index.html" class="btn btn-primary">去购物</a>
        </div>
      `;
    } else {
      html += filtered.map(order => `
        <div class="order-card">
          <!-- 订单头部信息 -->
          <div class="order-card-header">
            <div>
              <span class="order-id">订单号：${order.id}</span>
              <span class="order-date" style="margin-left:16px">${Common.formatDate(order.createTime)}</span>
            </div>
            <span class="order-status ${order.status}">${Common.orderStatusMap[order.status]}</span>
          </div>
          <!-- 订单商品列表 -->
          <div class="order-card-body">
            ${order.items.map(item => {
        const imgSrc = fixImgPath(item.image && item.image.startsWith('images/') ? item.image : `images/${item.productId % 26 || 26}.png`);
        return `
              <div class="order-item-row">
                <div class="order-item-img"><img src="${imgSrc}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"></div>
                <div class="order-item-info">
                  <div class="order-item-name">${item.name}</div>
                  <div class="order-item-spec">${item.spec ? Object.entries(item.spec).map(([k, v]) => `${k}：${v}`).join('；') : ''}</div>
                </div>
                <div class="order-item-price">
                  <div class="price">¥${Common.formatPrice(item.price)}</div>
                  <div class="qty">x${item.quantity}</div>
                </div>
              </div>
            `}).join('')}
            <!-- 订单详情信息 -->
            <div class="order-detail-info">
              <div class="info-row"><span class="label">收货人：</span><span>${order.address.name} ${order.address.phone}</span></div>
              <div class="info-row"><span class="label">收货地址：</span><span>${order.address.full}</span></div>
              <div class="info-row"><span class="label">支付方式：</span><span>${getPayMethodLabel(order.paymentMethod)}</span></div>
            </div>
          </div>
          <!-- 订单底部操作 -->
          <div class="order-card-footer">
            <div class="order-total">
              合计：<span class="amount">${order.total.toFixed(2)}</span>
            </div>
            <div class="order-actions">
              ${order.status === 'pending' ? `
                <button class="btn btn-primary btn-sm" onclick="OrderPage.openPayModal('${order.id}')">立即支付</button>
                <button class="btn btn-outline btn-sm" onclick="OrderPage.cancelOrder('${order.id}')">取消订单</button>
              ` : ''}
              ${order.status === 'paid' ? `<button class="btn btn-outline btn-sm">查看物流</button>` : ''}
              ${order.status === 'completed' ? `<button class="btn btn-outline btn-sm">再次购买</button>` : ''}
            </div>
          </div>
        </div>
      `).join('');
    }

    container.innerHTML = html;
  }

  // 获取支付方式显示文本
  function getPayMethodLabel(method) {
    const map = { alipay: '支付宝', wechat: '微信支付', card: '银行卡', cod: '货到付款' };
    return map[method] || method;
  }

  // 筛选订单
  function filterOrders(filter) {
    currentFilter = filter;
    renderPage();
  }

  // 打开支付弹窗
  function openPayModal(orderId) {
    payingOrderId = orderId;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    document.getElementById('payModalDesc').textContent = `订单号：${orderId}，支付金额：¥${order.total.toFixed(2)}`;
    document.getElementById('payModal').classList.add('active');
  }

  // 关闭支付弹窗
  function closePayModal() {
    document.getElementById('payModal').classList.remove('active');
    payingOrderId = null;
  }

  // 确认支付
  async function confirmPay() {
    if (!payingOrderId) return;
    const btn = document.getElementById('payConfirmBtn');
    btn.disabled = true;
    btn.textContent = '支付中...';

    try {
      await API.payOrder(payingOrderId);
      Common.toast('支付成功！');
      closePayModal();
      // 重新加载订单数据
      orders = await API.getUserOrders();
      renderPage();
    } catch (err) {
      Common.toast(err.message, 'error');
    }

    btn.disabled = false;
    btn.textContent = '确认支付';
  }

  // 取消订单
  function cancelOrder(orderId) {
    if (!confirm('确定要取消此订单吗？')) return;
    const allOrders = API.getOrders();
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
      order.status = 'cancelled';
      localStorage.setItem('shop_orders', JSON.stringify(allOrders));
      Common.toast('订单已取消');
      loadOrders();
    }
  }

  // 初始化页面
  function init() {
    Common.initPage();
    loadOrders();
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);

  // 返回公共接口
  return { filterOrders, openPayModal, closePayModal, confirmPay, cancelOrder };
})();
