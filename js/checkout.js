/**
 * 结算页面逻辑 - 地址表单验证、支付方式选择、订单创建
 */
const CheckoutPage = (() => {
  // 购物车商品数据
  let cartItems = [];
  // 选中的支付方式
  let selectedPayment = 'alipay';

  // 渲染结算页面
  function render() {
    const user = API.getCurrentUser();
    if (!user) {
      location.href = 'login.html?redirect=checkout.html';
      return;
    }

    cartItems = API.getCart().filter(i => i.checked);
    if (cartItems.length === 0) {
      Common.toast('购物车为空', 'info');
      setTimeout(() => location.href = 'cart.html', 500);
      return;
    }

    // 计算订单金额
    const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal >= 99 ? 0 : 10;
    const total = subtotal + shipping;

    const container = document.getElementById('checkoutPage');
    container.innerHTML = `
      <div class="checkout-layout">
        <div class="checkout-left">
          <!-- 收货地址区域 -->
          <div class="checkout-section">
            <h3><span class="icon">📍</span> 收货地址</h3>
            <form id="addressForm" class="address-form" onsubmit="return false">
              <div class="form-group">
                <label>收货人</label>
                <input type="text" class="form-control" id="addrName" placeholder="请输入收货人姓名" value="${user.username || ''}">
                <div class="error-msg" id="addrNameError"></div>
              </div>
              <div class="form-group">
                <label>联系电话</label>
                <input type="tel" class="form-control" id="addrPhone" placeholder="请输入手机号" value="${user.phone || ''}">
                <div class="error-msg" id="addrPhoneError"></div>
              </div>
              <div class="form-group">
                <label>所在地区</label>
                <select class="form-control" id="addrProvince">
                  <option value="">请选择省份</option>
                  <option value="北京市">北京市</option>
                  <option value="上海市">上海市</option>
                  <option value="广东省">广东省</option>
                  <option value="浙江省">浙江省</option>
                  <option value="江苏省">江苏省</option>
                  <option value="四川省">四川省</option>
                  <option value="湖北省">湖北省</option>
                  <option value="山东省">山东省</option>
                  <option value="福建省">福建省</option>
                  <option value="河南省">河南省</option>
                </select>
                <div class="error-msg" id="addrProvinceError"></div>
              </div>
              <div class="form-group">
                <label>详细地址</label>
                <input type="text" class="form-control" id="addrDetail" placeholder="街道、门牌号等">
                <div class="error-msg" id="addrDetailError"></div>
              </div>
              <div class="form-group full">
                <label>邮政编码（选填）</label>
                <input type="text" class="form-control" id="addrZip" placeholder="邮政编码" style="max-width:200px">
              </div>
            </form>
          </div>

          <!-- 支付方式区域 -->
          <div class="checkout-section">
            <h3><span class="icon">💳</span> 支付方式</h3>
            <div class="payment-methods" id="paymentMethods">
              <div class="payment-option active" onclick="CheckoutPage.selectPayment('alipay', this)">
                <input type="radio" name="payment" value="alipay" checked>
                <span class="pay-icon">💙</span>
                <span class="pay-name">支付宝</span>
              </div>
              <div class="payment-option" onclick="CheckoutPage.selectPayment('wechat', this)">
                <input type="radio" name="payment" value="wechat">
                <span class="pay-icon">💚</span>
                <span class="pay-name">微信支付</span>
              </div>
              <div class="payment-option" onclick="CheckoutPage.selectPayment('card', this)">
                <input type="radio" name="payment" value="card">
                <span class="pay-icon">💳</span>
                <span class="pay-name">银行卡</span>
              </div>
              <div class="payment-option" onclick="CheckoutPage.selectPayment('cod', this)">
                <input type="radio" name="payment" value="cod">
                <span class="pay-icon">📦</span>
                <span class="pay-name">货到付款</span>
              </div>
            </div>
          </div>

          <!-- 商品清单区域 -->
          <div class="checkout-section">
            <h3><span class="icon">📋</span> 商品清单 (${cartItems.length}件)</h3>
            <div class="order-items">
              ${cartItems.map(item => {
      const imgSrc = item.image && item.image.startsWith('images/') ? item.image : `images/${item.productId % 26 || 26}.png`;
      return `
                <div class="order-item">
                  <div class="oi-img"><img src="${imgSrc}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"></div>
                  <div class="oi-info">
                    <div class="oi-name">${item.name}</div>
                    <div class="oi-spec">${item.spec ? Object.entries(item.spec).map(([k, v]) => `${k}：${v}`).join('；') : ''}</div>
                  </div>
                  <div class="oi-price">
                    <div class="price">¥${Common.formatPrice(item.price)}</div>
                    <div class="qty">x${item.quantity}</div>
                  </div>
                </div>
              `}).join('')}
            </div>
          </div>
        </div>

        <!-- 订单摘要侧边栏 -->
        <div class="checkout-summary">
          <h3 style="margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--border)">订单摘要</h3>
          <div class="summary-rows">
            <div class="summary-row">
              <span class="label">商品金额</span>
              <span>¥${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="label">运费</span>
              <span>${shipping === 0 ? '免运费' : '¥' + shipping.toFixed(2)}</span>
            </div>
            ${subtotal < 99 ? '<div class="summary-row"><span class="label" style="color:var(--secondary);font-size:12px">满99元免运费</span><span></span></div>' : ''}
          </div>
          <div class="summary-row total">
            <span>应付金额</span>
            <span class="value">${total.toFixed(2)}</span>
          </div>
          <button class="btn btn-primary btn-submit-order" onclick="CheckoutPage.submitOrder()">
            提交订单
          </button>
          <p style="text-align:center;font-size:12px;color:var(--text-lighter);margin-top:12px">
            点击提交即表示您同意《用户服务协议》
          </p>
        </div>
      </div>
    `;
  }

  // 选择支付方式
  function selectPayment(method, el) {
    selectedPayment = method;
    document.querySelectorAll('.payment-option').forEach(opt => {
      opt.classList.remove('active');
      opt.querySelector('input').checked = false;
    });
    el.classList.add('active');
    el.querySelector('input').checked = true;
  }

  // 验证收货地址表单
  function validateAddress() {
    let valid = true;

    const name = document.getElementById('addrName').value.trim();
    const nameErr = document.getElementById('addrNameError');
    if (!name) {
      nameErr.textContent = '请输入收货人姓名';
      nameErr.classList.add('show');
      valid = false;
    } else {
      nameErr.classList.remove('show');
    }

    const phone = document.getElementById('addrPhone').value.trim();
    const phoneErr = document.getElementById('addrPhoneError');
    if (!phone) {
      phoneErr.textContent = '请输入联系电话';
      phoneErr.classList.add('show');
      valid = false;
    } else if (!/^1[3-9]\d{9}$/.test(phone)) {
      phoneErr.textContent = '请输入正确的手机号';
      phoneErr.classList.add('show');
      valid = false;
    } else {
      phoneErr.classList.remove('show');
    }

    const province = document.getElementById('addrProvince').value;
    const provErr = document.getElementById('addrProvinceError');
    if (!province) {
      provErr.textContent = '请选择所在地区';
      provErr.classList.add('show');
      valid = false;
    } else {
      provErr.classList.remove('show');
    }

    const detail = document.getElementById('addrDetail').value.trim();
    const detailErr = document.getElementById('addrDetailError');
    if (!detail) {
      detailErr.textContent = '请输入详细地址';
      detailErr.classList.add('show');
      valid = false;
    } else {
      detailErr.classList.remove('show');
    }

    return valid;
  }

  // 提交订单
  async function submitOrder() {
    if (!validateAddress()) {
      Common.toast('请填写完整的收货信息', 'error');
      return;
    }

    const address = {
      name: document.getElementById('addrName').value.trim(),
      phone: document.getElementById('addrPhone').value.trim(),
      province: document.getElementById('addrProvince').value,
      detail: document.getElementById('addrDetail').value.trim(),
      zip: document.getElementById('addrZip').value.trim(),
      full: `${document.getElementById('addrProvince').value} ${document.getElementById('addrDetail').value.trim()}`
    };

    const btn = document.querySelector('.btn-submit-order');
    btn.disabled = true;
    btn.textContent = '提交中...';

    try {
      const order = await API.createOrder(cartItems, address, selectedPayment);
      Common.toast('订单创建成功！');
      setTimeout(() => {
        location.href = `order.html?pay=${order.id}`;
      }, 800);
    } catch (err) {
      Common.toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = '提交订单';
    }
  }

  // 初始化页面
  function init() {
    Common.initPage();
    render();
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);

  // 返回公共接口
  return { selectPayment, submitOrder };
})();
