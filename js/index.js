/**
 * 首页逻辑模块
 * 处理首页的轮播图、商品分类、商品列表等功能
 */
const IndexPage = (() => {
  // 当前排序方式
  let currentSort = 'default';
  // 当前选中的分类ID
  let currentCategory = null;
  // 当前搜索关键词
  let currentKeyword = null;
  // 轮播图定时器
  let carouselTimer = null;
  // 当前轮播图索引
  let carouselIndex = 0;
  // 轮播图数据
  let banners = [];

  // 轮播图控制对象 - 提供前进、后退和跳转功能
  const carousel = {
    // 显示下一张轮播图
    next() {
      const track = document.getElementById('carousel');
      if (!track) return;
      carouselIndex++;
      track.style.transition = 'transform 0.5s ease';
      track.style.transform = `translateX(-${carouselIndex * 100}%)`;
      updateDots(carouselIndex % banners.length);
      // 到达最后一张时，重置到第一张实现无缝循环
      if (carouselIndex >= banners.length) {
        setTimeout(() => {
          track.style.transition = 'none';
          carouselIndex = 0;
          track.style.transform = `translateX(0)`;
          updateDots(0);
        }, 500);
      }
    },
    // 显示上一张轮播图
    prev() {
      const track = document.getElementById('carousel');
      if (!track) return;
      // 在第一张时，先跳转到最后一张实现无缝循环
      if (carouselIndex <= 0) {
        track.style.transition = 'none';
        carouselIndex = banners.length;
        track.style.transform = `translateX(-${carouselIndex * 100}%)`;
        void track.offsetWidth;
      }
      carouselIndex--;
      track.style.transition = 'transform 0.5s ease';
      track.style.transform = `translateX(-${carouselIndex * 100}%)`;
      updateDots(carouselIndex % banners.length);
    },
    // 跳转到指定索引的轮播图
    goTo(i) {
      carouselIndex = i;
      const track = document.getElementById('carousel');
      if (!track) return;
      track.style.transition = 'transform 0.5s ease';
      track.style.transform = `translateX(-${i * 100}%)`;
      updateDots(i);
    }
  };

  // 更新轮播图指示器状态
  function updateDots(dotIndex) {
    document.querySelectorAll('.carousel-dots .dot').forEach((d, i) => d.classList.toggle('active', i === dotIndex));
  }

  // 开始自动播放轮播图
  function startAutoPlay() {
    stopAutoPlay();
    carouselTimer = setInterval(() => carousel.next(), 4000);
  }

  // 停止自动播放轮播图
  function stopAutoPlay() {
    if (carouselTimer) clearInterval(carouselTimer);
  }

  // 渲染轮播图内容
  async function renderBanners() {
    banners = await API.getBanners();
    const track = document.getElementById('carousel');
    const dotsContainer = document.getElementById('carouselDots');
    if (!track) return;

    // 轮播图文字内容配置
    const textContents = [
      { top: '智能家电臻品之选', middle: '畅享家居全新境界', sub: '高效节能 惊喜优惠' },
      { top: '创新手机科技', middle: '折叠时尚触手可及', sub: '流畅体验 限时钜惠' },
      { top: '电脑全系性能巅峰', middle: '工作娱乐畅享无忧', sub: '极速性能 超值钜惠' }
    ];

    // 生成轮播图幻灯片HTML
    const slidesHTML = banners.map((b, i) => `
      <div class="carousel-slide" onclick="IndexPage.filterByCategory(${b.category})" style="cursor:pointer;background-image:url('${b.image}');background-size:cover;background-position:center;">
        <div class="carousel-text-overlay">
          <div class="title-top">${textContents[i].top}</div>
          <div class="title-middle">${textContents[i].middle}</div>
          <div class="subtitle">${textContents[i].sub}</div>
        </div>
      </div>
    `).join('');
    // 克隆第一张幻灯片到末尾，实现无缝循环
    const firstClone = `
      <div class="carousel-slide" onclick="IndexPage.filterByCategory(${banners[0].category})" style="cursor:pointer;background-image:url('${banners[0].image}');background-size:cover;background-position:center;">
        <div class="carousel-text-overlay">
          <div class="title-top">${textContents[0].top}</div>
          <div class="title-middle">${textContents[0].middle}</div>
          <div class="subtitle">${textContents[0].sub}</div>
        </div>
      </div>
    `;
    track.innerHTML = slidesHTML + firstClone;

    // 生成轮播图指示器
    dotsContainer.innerHTML = banners.map((_, i) =>
      `<span class="dot ${i === 0 ? 'active' : ''}" onclick="IndexPage.carousel.goTo(${i})"></span>`
    ).join('');

    // 开始自动播放
    startAutoPlay();

    // 鼠标悬停时暂停自动播放
    const wrapper = track.closest('.carousel-wrapper');
    if (wrapper) {
      wrapper.addEventListener('mouseenter', stopAutoPlay);
      wrapper.addEventListener('mouseleave', startAutoPlay);
    }
  }

  // 渲染商品分类
  async function renderCategories() {
    const categories = await API.getCategories();
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    // 生成分类列表HTML（侧边栏样式）
    grid.innerHTML = categories.map(c => `
      <div class="category-item ${currentCategory === c.id ? 'active' : ''}"
           onclick="IndexPage.filterByCategory(${c.id})">
        <span>${c.name}</span>
      </div>
    `).join('');
  }

  // 渲染商品列表
  async function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    // 显示加载状态
    grid.innerHTML = '<div class="loading">加载中</div>';

    // 构建筛选条件
    const filters = { sort: currentSort };
    if (currentCategory) filters.category = currentCategory;
    if (currentKeyword) filters.keyword = currentKeyword;

    const products = await API.getProducts(filters);

    // 处理空结果情况
    if (products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1">
          <div class="empty-icon">🔍</div>
          <h3>未找到相关商品</h3>
          <p>换个关键词试试吧</p>
        </div>
      `;
      return;
    }

    // 生成商品卡片HTML
    grid.innerHTML = products.map(p => Common.productCardHTML(p)).join('');
  }

  // 按分类筛选商品
  function filterByCategory(catId) {
    // 跳转到index.html并带上分类参数，然后滚动到商品区域
    location.href = `index.html?category=${catId}#categories`;
  }

  // 更新商品列表标题
  function updateTitle() {
    const titleEl = document.getElementById('productsTitle');
    if (!titleEl) return;
    // 根据当前状态显示不同标题
    if (currentKeyword) {
      titleEl.textContent = `"${currentKeyword}" 的搜索结果`;
    } else if (currentCategory) {
      const cat = { 1: '手机数码', 2: '电脑办公', 3: '家用电器', 4: '服饰鞋包', 5: '美妆护肤', 6: '食品生鲜', 7: '运动户外', 8: '图书文具' };
      titleEl.textContent = cat[currentCategory] || '商品列表';
    } else if (currentSort === 'sales') {
      titleEl.textContent = '热销排行';
    } else if (currentSort === 'new') {
      titleEl.textContent = '新品上市';
    } else {
      titleEl.textContent = '热销商品';
    }
  }

  // 渲染用户信息面板
  function renderUserPanel() {
    const panel = document.getElementById('userPanel');
    if (!panel) return;
    const user = API.getCurrentUser();
    // 根据登录状态显示不同内容
    if (user) {
      panel.innerHTML = `
        <div class="user-welcome">
          <span style="font-size:36px">${user.avatar || '👤'}</span>
          <p>Hi，${user.username}</p>
          <div class="user-links">
            <a href="pages/user.html">个人中心</a>
            <a href="pages/order.html">我的订单</a>
          </div>
        </div>
      `;
    } else {
      panel.innerHTML = `
        <div class="user-welcome">
          <span style="font-size:36px">👤</span>
          <p>Hi，欢迎来到优品商城</p>
          <div class="user-links">
            <a href="pages/login.html" class="btn btn-primary btn-sm">登录</a>
            <a href="pages/register.html" class="btn btn-outline btn-sm">注册</a>
          </div>
        </div>
      `;
    }
  }

  // 初始化排序选项卡
  function initSortTabs() {
    const tabs = document.getElementById('sortTabs');
    if (!tabs) return;
    // 为排序选项卡添加点击事件监听
    tabs.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      tabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentSort = e.target.dataset.sort;
      renderProducts();
    });
  }

  // 初始化页面
  async function init() {
    Common.initPage();
    renderUserPanel();

    // 检查URL参数
    currentKeyword = Common.getParam('keyword');
    const sortParam = Common.getParam('sort');
    if (sortParam === 'sales' || sortParam === 'new') {
      currentSort = sortParam;
    }
    // 读取分类参数
    const categoryParam = Common.getParam('category');
    if (categoryParam) {
      currentCategory = parseInt(categoryParam);
    }

    updateTitle();
    initSortTabs();

    // 高亮匹配的排序选项卡
    if (currentSort !== 'default') {
      const tabs = document.getElementById('sortTabs');
      if (tabs) {
        tabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        const match = tabs.querySelector(`[data-sort="${currentSort}"]`);
        if (match) match.classList.add('active');
      }
    }

    // 并行加载所有内容
    await Promise.all([
      renderBanners(),
      renderCategories(),
      renderProducts()
    ]);

    // 内容加载后滚动到相关区域
    if (currentSort !== 'default') {
      const section = document.querySelector('.products-section');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (location.hash === '#categories') {
      const section = document.getElementById('categories');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);

  // 暴露公共接口
  return { carousel, filterByCategory };
})();
