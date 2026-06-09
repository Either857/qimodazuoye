/**
 * 用户中心页面逻辑 - 个人资料、订单、设置
 */
const UserPage = (() => {
  // 当前标签页
  let currentTab = 'profile';
  // 订单数据
  let orders = [];

  // 渲染用户中心页面
  async function render() {
    const user = API.getCurrentUser();
    if (!user) {
      location.href = 'login.html?redirect=user.html';
      return;
    }

    orders = await API.getUserOrders();
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const paidCount = orders.filter(o => o.status === 'paid').length;
    const shippedCount = orders.filter(o => o.status === 'shipped').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;

    const container = document.getElementById('userPage');
    container.innerHTML = `
      <!-- 用户侧边栏 -->
      <div class="user-sidebar">
        <div class="user-profile-card">
          <div class="user-avatar">${user.avatar || '👤'}</div>
          <div class="user-name">${user.username}</div>
          <div class="user-email">${user.email || ''}</div>
        </div>
        <div class="user-menu">
          <a href="#" class="${currentTab === 'profile' ? 'active' : ''}" onclick="UserPage.switchTab('profile');return false">
            <span class="menu-icon">👤</span> 个人资料
          </a>
          <a href="#" class="${currentTab === 'orders' ? 'active' : ''}" onclick="UserPage.switchTab('orders');return false">
            <span class="menu-icon">📦</span> 我的订单
          </a>
          <a href="#" class="${currentTab === 'security' ? 'active' : ''}" onclick="UserPage.switchTab('security');return false">
            <span class="menu-icon">🔒</span> 账户安全
          </a>
          <a href="cart.html">
            <span class="menu-icon">🛒</span> 我的购物车
          </a>
          <a href="#" onclick="Common.doLogout();return false">
            <span class="menu-icon">🚪</span> 退出登录
          </a>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="user-content" id="userContent">
        ${renderContent(user, pendingCount, paidCount, shippedCount, completedCount)}
      </div>
    `;
  }

  // 渲染内容区域
  function renderContent(user, pendingCount, paidCount, shippedCount, completedCount) {
    switch (currentTab) {
      case 'profile': return renderProfile(user);
      case 'orders': return renderOrders();
      case 'security': return renderSecurity(user);
      default: return renderProfile(user);
    }
  }

  // 渲染个人资料
  function renderProfile(user) {
    return `
      <h3 class="content-header">个人资料</h3>
      <form class="profile-form" onsubmit="return UserPage.saveProfile(event)">
        <div class="form-row">
          <label>用户名</label>
          <span class="read-only">${user.username}</span>
        </div>
        <div class="form-row">
          <label>邮箱</label>
          <input type="email" class="form-control" id="profileEmail" value="${user.email || ''}">
        </div>
        <div class="form-row">
          <label>手机号</label>
          <input type="tel" class="form-control" id="profilePhone" value="${user.phone || ''}">
        </div>
        <div class="form-row">
          <label>昵称</label>
          <input type="text" class="form-control" id="profileNickname" value="${user.nickname || ''}" placeholder="设置一个昵称">
        </div>
        <div class="form-row">
          <label></label>
          <button type="submit" class="btn btn-primary">保存修改</button>
        </div>
      </form>

      <!-- 最近订单区域 -->
      <div class="recent-orders" style="margin-top:40px">
        <h3 class="content-header">最近订单</h3>
        ${orders.length === 0 ? '<p style="color:var(--text-lighter);text-align:center;padding:30px">暂无订单记录</p>' :
        orders.slice(0, 5).map(order => {
          const firstItem = order.items[0];
          const imgSrc = firstItem?.image && firstItem.image.startsWith('images/') ? firstItem.image : `images/${firstItem?.productId % 26 || 26}.png`;
          return `
            <div class="recent-order-item" onclick="location.href='order.html'" style="cursor:pointer">
              <div class="roi-img"><img src="${imgSrc}" alt="${firstItem?.name || '商品'}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"></div>
              <div class="roi-info">
                <div class="roi-name">${firstItem?.name || '商品'}${order.items.length > 1 ? ` 等${order.items.length}件商品` : ''}</div>
                <div class="roi-date">${Common.formatDate(order.createTime)} | 订单号：${order.id}</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:700;color:var(--primary);font-size:14px">¥${order.total.toFixed(2)}</div>
                <span class="order-status ${order.status}" style="margin-top:4px">${Common.orderStatusMap[order.status]}</span>
              </div>
            </div>
          `}).join('')
      }
      </div>
    `;
  }

  // 渲染订单列表
  function renderOrders() {
    return `
      <h3 class="content-header">我的订单 (${orders.length})</h3>
      ${orders.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>暂无订单</h3>
          <p>快去选购心仪的商品吧</p>
          <a href="../index.html" class="btn btn-primary">去购物</a>
        </div>
      ` : orders.map(order => `
        <div style="padding:14px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:14px;margin-bottom:4px">${order.items.map(i => i.name).join('、')}</div>
            <div style="font-size:12px;color:var(--text-lighter)">${Common.formatDate(order.createTime)} | 订单号：${order.id}</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:700;color:var(--primary)">¥${order.total.toFixed(2)}</div>
            <span class="order-status ${order.status}">${Common.orderStatusMap[order.status]}</span>
          </div>
        </div>
      `).join('')}
    `;
  }

  // 渲染账户安全信息
  function renderSecurity(user) {
    return `
      <h3 class="content-header">账户安全</h3>
      <div class="profile-form">
        <div class="form-row">
          <label>登录密码</label>
          <span class="read-only">已设置（******）</span>
          <button class="btn btn-outline btn-sm" style="margin-left:12px" onclick="UserPage.changePassword()">修改</button>
        </div>
        <div class="form-row">
          <label>绑定手机</label>
          <span class="read-only">${user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定'}</span>
        </div>
        <div class="form-row">
          <label>绑定邮箱</label>
          <span class="read-only">${user.email || '未绑定'}</span>
        </div>
        <div class="form-row">
          <label>注册时间</label>
          <span class="read-only">${user.createTime ? Common.formatDate(user.createTime) : '-'}</span>
        </div>
      </div>
    `;
  }

  // 切换标签页
  function switchTab(tab) {
    currentTab = tab;
    render();
  }

  // 保存个人资料
  async function saveProfile(e) {
    e.preventDefault();
    const email = document.getElementById('profileEmail').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const nickname = document.getElementById('profileNickname').value.trim();

    // 验证表单
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Common.toast('邮箱格式不正确', 'error');
      return false;
    }
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      Common.toast('手机号格式不正确', 'error');
      return false;
    }

    try {
      await API.updateProfile({ email, phone, nickname });
      Common.toast('资料更新成功');
      render();
    } catch (err) {
      Common.toast(err.message, 'error');
    }

    return false;
  }

  // 修改密码
  function changePassword() {
    Common.toast('密码修改功能开发中', 'info');
  }

  // 初始化页面
  function init() {
    Common.initPage();
    render();
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);

  // 返回公共接口
  return { switchTab, saveProfile, changePassword };
})();
