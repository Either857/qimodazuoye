/**
 * 公共工具模块 - 包含页头、页脚、消息提示、导航等功能
 */
const Common = (() => {
  // 获取页面基础路径（根据当前页面位置判断是否需要加前缀）
  function getBasePath() {
    const path = location.pathname;
    if (path.includes('/pages/') || path.includes('\\pages\\')) {
      return '';
    }
    return 'pages/';
  }

  // 消息提示功能
  function toast(message, type = 'success', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span style="font-size:18px;font-weight:700">${icons[type] || ''}</span><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  // 渲染页头
  function renderHeader() {
    const user = API.getCurrentUser();
    const cartCount = API.getCartCount();
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const bp = getBasePath();
    // 判断是否在首页（根目录的index.html）
    const isIndex = currentPage === 'index.html' && !location.pathname.includes('/pages/');
    const indexHref = isIndex ? 'index.html' : '../index.html';

    return `
      <header class="site-header">
        <!-- 顶部导航栏 - 包含用户信息和快捷链接 -->
        <div class="header-top">
          <div class="container">
            <div class="header-top-left">
              <span style="margin-right:15px;">24215220126 张雄富</span>
              ${user
        ? `<span>欢迎您，<strong>${user.username}</strong></span>
                   <a href="${bp}user.html">个人中心</a>
                   <a href="#" onclick="Common.doLogout();return false;">退出登录</a>`
        : `<a href="${bp}login.html">请登录</a>
                   <a href="${bp}register.html">免费注册</a>`
      }
            </div>
            <div class="header-top-right">
              <a href="${bp}order.html">我的订单</a>
              <a href="${bp}cart.html">购物车</a>
            </div>
          </div>
        </div>
        <!-- 主导航区域 - 包含logo、搜索框和购物车 -->
        <div class="header-main">
          <div class="container header-main-inner">
            <div class="header-left">
              <a href="${indexHref}" class="logo">优品<span>商城</span></a>
            </div>
            <div class="header-center">
              <div class="search-box">
                <input type="text" id="searchInput" placeholder="搜索商品..." value=""
                       onkeypress="if(event.key==='Enter')Common.doSearch()">
                <button onclick="Common.doSearch()">搜索</button>
              </div>
            </div>
            <div class="header-right">
              <div class="header-actions">
                <a href="${bp}cart.html" class="cart-badge">
                  <span class="icon">🛒</span>
                  <span class="badge" id="cartBadge">${cartCount}</span>
                  <span>购物车</span>
                </a>
                <a href="${bp}user.html">
                  <span class="icon">👤</span>
                  <span>我的</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <!-- 主导航菜单 - 包含主要功能页面链接 -->
        <nav class="main-nav">
          <div class="container">
            <ul class="nav-list">
              <li><a href="${indexHref}" class="${isIndex && !location.search ? 'active' : ''}">首页</a></li>
              <li><a href="${indexHref}#categories" class="">全部分类</a></li>
              <li><a href="${indexHref}?sort=sales" class="${location.search.includes('sort=sales') ? 'active' : ''}">热销排行</a></li>
              <li><a href="${indexHref}?sort=new" class="${location.search.includes('sort=new') ? 'active' : ''}">新品上市</a></li>
              <li><a href="${bp}cart.html" class="${currentPage === 'cart.html' ? 'active' : ''}">购物车</a></li>
            </ul>
          </div>
        </nav>
      </header>
    `;
  }

  // 渲染页脚
  function renderFooter() {
    return `
      <footer class="site-footer">
        <!-- 页脚主要内容区域 -->
        <div class="footer-main">
          <div class="container">
            <div class="footer-col">
              <h4>购物指南</h4>
              <ul>
                <li><a href="#">购物流程</a></li>
                <li><a href="#">会员介绍</a></li>
                <li><a href="#">常见问题</a></li>
                <li><a href="#">联系客服</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>配送方式</h4>
              <ul>
                <li><a href="#">上门自提</a></li>
                <li><a href="#">快递配送</a></li>
                <li><a href="#">特快专递</a></li>
                <li><a href="#">配送范围</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>支付方式</h4>
              <ul>
                <li><a href="#">在线支付</a></li>
                <li><a href="#">货到付款</a></li>
                <li><a href="#">分期付款</a></li>
                <li><a href="#">公司转账</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>关于我们</h4>
              <ul>
                <li><a href="#">关于我们</a></li>
                <li><a href="#">加入我们</a></li>
                <li><a href="#">商家入驻</a></li>
                <li><a href="#">友情链接</a></li>
              </ul>
            </div>
          </div>
        </div>
        <!-- 页脚底部版权信息 -->
        <div class="footer-bottom">
          <div class="container">
            <p>© 2026 优品商城 版权所有 | 仿真实训项目 - 使用 HTML5 + CSS3 + JavaScript + Ajax + JSON 技术</p>
          </div>
        </div>
      </footer>
    `;
  }

  // 初始化页面布局
  function initPage() {
    // 插入页头
    const headerEl = document.getElementById('siteHeader');
    if (headerEl) headerEl.innerHTML = renderHeader();

    // 插入页脚
    const footerEl = document.getElementById('siteFooter');
    if (footerEl) footerEl.innerHTML = renderFooter();

    // 监听购物车更新事件
    window.addEventListener('cartUpdated', updateCartBadge);

    // 导航链接点击处理
    document.querySelectorAll('.nav-list a').forEach(link => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        const currentPage = location.pathname.split('/').pop() || 'index.html';
        const isIndex = currentPage === 'index.html' && !location.pathname.includes('/pages/');

        // 处理页面内锚点链接（如 index.html#categories）
        if (href.includes('#categories') && isIndex) {
          e.preventDefault();
          // 清除排序/关键词筛选条件
          if (location.search) {
            location.href = href;
          } else {
            const target = document.getElementById('categories');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }

        // 处理页面内排序链接（如 index.html?sort=sales）
        if (href.includes('index.html?') && isIndex) {
          // 让浏览器导航 - 带新参数完全重新加载
          return;
        }

        // 处理页面内首页链接
        if ((href === 'index.html' || href === '../index.html') && isIndex) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      });
    });
  }

  // 更新购物车数量徽章
  function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = API.getCartCount();
  }

  // 执行搜索
  function doSearch() {
    const input = document.getElementById('searchInput');
    const keyword = input ? input.value.trim() : '';
    if (keyword) {
      const indexHref = getBasePath() ? '../index.html' : 'index.html';
      location.href = `${indexHref}?keyword=${encodeURIComponent(keyword)}`;
    }
  }

  // 执行退出登录
  function doLogout() {
    API.logout();
    toast('已退出登录');
    setTimeout(() => location.reload(), 500);
  }

  // 格式化价格
  function formatPrice(price) {
    return price.toFixed(2);
  }

  // 格式化日期
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // 订单状态映射
  const orderStatusMap = {
    pending: '待付款',
    paid: '已付款',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  };

  // 获取URL参数
  function getParam(name) {
    return new URLSearchParams(location.search).get(name);
  }

  // 生成商品卡片HTML
  function productCardHTML(product) {
    const discount = Math.round((1 - product.price / product.originalPrice) * 100);
    const bp = getBasePath();
    const imgPrefix = bp ? '' : '../';
    const imgSrc = product.image && product.image.startsWith('images/') ? `${imgPrefix}${product.image}` : `${imgPrefix}images/${product.id % 26 || 26}.png`;
    return `
      <div class="product-card" onclick="location.href='${bp}product.html?id=${product.id}'">
        <div class="product-img"><img src="${imgSrc}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover"></div>
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-price">
            <span class="price-current">¥${formatPrice(product.price)}</span>
            <span class="price-original">¥${formatPrice(product.originalPrice)}</span>
            <span class="tag tag-sale">-${discount}%</span>
          </div>
          <div class="product-meta">
            <span>已售 ${product.sales > 10000 ? (product.sales / 10000).toFixed(1) + '万' : product.sales}</span>
            <span>★ ${product.rating}</span>
          </div>
        </div>
      </div>
    `;
  }

  return {
    toast, initPage, updateCartBadge, doSearch, doLogout,
    formatPrice, formatDate, getParam, productCardHTML,
    renderHeader, renderFooter, orderStatusMap, getBasePath
  };
})();
