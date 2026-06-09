/**
 * API层 - 使用localStorage和JSON数据模拟后端服务
 */
const API = (() => {
  // 商品数据缓存
  let _products = null;
  // 分类数据缓存
  let _categories = null;
  // 轮播图数据缓存
  let _banners = null;

  // 模拟网络延迟
  function delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 通过模拟Ajax加载商品数据
  async function loadData() {
    if (_products) return;
    await delay(200);
    try {
      // 使用fetch API加载JSON数据
      const resp = await fetch('data/products.json');
      const data = await resp.json();
      _products = data.products;
      _categories = data.categories;
      _banners = data.banners;
    } catch (e) {
      // 备用方案：使用XMLHttpRequest加载内联JSON（Ajax）
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/products.json', true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const data = JSON.parse(xhr.responseText);
              _products = data.products;
              _categories = data.categories;
              _banners = data.banners;
              resolve();
            } else {
              reject(new Error('Failed to load data'));
            }
          }
        };
        xhr.send();
      });
    }
  }

  // 获取商品列表
  async function getProducts(filters = {}) {
    await loadData();
    let list = [..._products];
    // 按分类筛选
    if (filters.category) {
      list = list.filter(p => p.category === filters.category);
    }
    // 按关键词搜索
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(kw) ||
        p.description.toLowerCase().includes(kw)
      );
    }
    // 按排序方式排序
    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc': list.sort((a, b) => a.price - b.price); break;
        case 'price-desc': list.sort((a, b) => b.price - a.price); break;
        case 'sales': list.sort((a, b) => b.sales - a.sales); break;
        case 'new': list.sort((a, b) => b.id - a.id); break;
        default: break;
      }
    }
    return list;
  }

  // 获取单个商品详情
  async function getProduct(id) {
    await loadData();
    return _products.find(p => p.id === Number(id)) || null;
  }

  // 获取商品分类
  async function getCategories() {
    await loadData();
    return _categories;
  }

  // 获取轮播图数据
  async function getBanners() {
    await loadData();
    return _banners;
  }

  // 搜索商品
  async function searchProducts(keyword) {
    return getProducts({ keyword });
  }

  // 用户认证（localStorage）
  // 获取所有用户
  function getUsers() {
    return JSON.parse(localStorage.getItem('shop_users') || '[]');
  }

  // 保存用户数据
  function saveUsers(users) {
    localStorage.setItem('shop_users', JSON.stringify(users));
  }

  // 获取当前登录用户
  function getCurrentUser() {
    const u = localStorage.getItem('shop_current_user');
    return u ? JSON.parse(u) : null;
  }

  // 用户注册
  async function register(username, password, phone) {
    await delay(500);
    const users = getUsers();
    if (users.find(u => u.username === username)) {
      throw new Error('用户名已存在');
    }
    if (phone && users.find(u => u.phone === phone)) {
      throw new Error('该手机号已注册');
    }
    const user = {
      id: Date.now(),
      username,
      password,
      phone,
      avatar: '👤',
      createTime: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
    return { ...user, password: undefined };
  }

  // 用户登录
  async function login(username, password) {
    await delay(500);
    const users = getUsers();
    const user = users.find(u =>
      (u.username === username || u.phone === username) &&
      u.password === password
    );
    if (!user) {
      throw new Error('用户名或密码错误');
    }
    const safe = { ...user, password: undefined };
    localStorage.setItem('shop_current_user', JSON.stringify(safe));
    return safe;
  }

  // 用户退出登录
  function logout() {
    localStorage.removeItem('shop_current_user');
  }

  // 更新用户资料
  async function updateProfile(data) {
    await delay(300);
    const current = getCurrentUser();
    if (!current) throw new Error('请先登录');
    const users = getUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx !== -1) {
      Object.assign(users[idx], data);
      saveUsers(users);
      const updated = { ...users[idx], password: undefined };
      localStorage.setItem('shop_current_user', JSON.stringify(updated));
      return updated;
    }
    throw new Error('用户不存在');
  }

  // 购物车功能（localStorage）
  // 获取购物车
  function getCart() {
    return JSON.parse(localStorage.getItem('shop_cart') || '[]');
  }

  // 保存购物车
  function saveCart(cart) {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
    // 触发购物车更新事件
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  // 添加商品到购物车
  async function addToCart(productId, spec, quantity = 1) {
    const product = await getProduct(productId);
    if (!product) throw new Error('商品不存在');
    const cart = getCart();
    const existing = cart.find(item =>
      item.productId === productId && JSON.stringify(item.spec) === JSON.stringify(spec)
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: Date.now(),
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        spec,
        quantity,
        checked: true
      });
    }
    saveCart(cart);
    return cart;
  }

  // 更新购物车项
  function updateCartItem(itemId, changes) {
    const cart = getCart();
    const item = cart.find(i => i.id === itemId);
    if (item) {
      Object.assign(item, changes);
      saveCart(cart);
    }
    return cart;
  }

  // 移除购物车项
  function removeCartItem(itemId) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== itemId);
    saveCart(cart);
    return cart;
  }

  // 清空购物车
  function clearCart() {
    saveCart([]);
  }

  // 获取购物车商品数量
  function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  // 获取购物车总金额
  function getCartTotal() {
    return getCart()
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // 订单功能（localStorage）
  // 获取所有订单
  function getOrders() {
    return JSON.parse(localStorage.getItem('shop_orders') || '[]');
  }

  // 创建订单
  async function createOrder(cartItems, address, paymentMethod) {
    await delay(800);
    const user = getCurrentUser();
    if (!user) throw new Error('请先登录');

    const order = {
      id: 'ORD' + Date.now(),
      userId: user.id,
      items: cartItems,
      address,
      paymentMethod,
      total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'pending',
      createTime: new Date().toISOString()
    };

    const orders = getOrders();
    orders.push(order);
    localStorage.setItem('shop_orders', JSON.stringify(orders));

    // 从购物车中移除已下单的商品
    const cart = getCart();
    const orderedIds = new Set(cartItems.map(i => i.id));
    saveCart(cart.filter(i => !orderedIds.has(i.id)));

    return order;
  }

  // 支付订单
  async function payOrder(orderId) {
    await delay(1000);
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('订单不存在');
    order.status = 'paid';
    order.payTime = new Date().toISOString();
    localStorage.setItem('shop_orders', JSON.stringify(orders));
    return order;
  }

  // 获取用户订单
  async function getUserOrders() {
    await delay(300);
    const user = getCurrentUser();
    if (!user) return [];
    return getOrders().filter(o => o.userId === user.id).reverse();
  }

  // 返回公共接口
  return {
    loadData, getProducts, getProduct, getCategories, getBanners, searchProducts,
    register, login, logout, getCurrentUser, updateProfile,
    getCart, addToCart, updateCartItem, removeCartItem, clearCart, getCartCount, getCartTotal,
    createOrder, payOrder, getUserOrders, getOrders
  };
})();
