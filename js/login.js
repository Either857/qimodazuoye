/**
 * 登录页面逻辑 - 表单验证和用户认证
 */
const LoginPage = (() => {
  // 验证表单
  function validate() {
    let valid = true;

    // 用户名验证
    const username = document.getElementById('loginUsername').value.trim();
    const usernameError = document.getElementById('loginUsernameError');
    if (!username) {
      showError('loginUsername', usernameError, '请输入用户名/邮箱/手机号');
      valid = false;
    } else if (username.length < 3) {
      showError('loginUsername', usernameError, '用户名至少3个字符');
      valid = false;
    } else {
      clearError('loginUsername', usernameError);
    }

    // 密码验证
    const password = document.getElementById('loginPassword').value;
    const passwordError = document.getElementById('loginPasswordError');
    if (!password) {
      showError('loginPassword', passwordError, '请输入密码');
      valid = false;
    } else if (password.length < 6) {
      showError('loginPassword', passwordError, '密码至少6个字符');
      valid = false;
    } else {
      clearError('loginPassword', passwordError);
    }

    return valid;
  }

  // 显示错误信息
  function showError(inputId, errorEl, msg) {
    document.getElementById(inputId).classList.add('error');
    errorEl.textContent = msg;
    errorEl.classList.add('show');
  }

  // 清除错误信息
  function clearError(inputId, errorEl) {
    document.getElementById(inputId).classList.remove('error');
    errorEl.classList.remove('show');
  }

  // 处理表单提交
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return false;

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');

    btn.disabled = true;
    btn.textContent = '登录中...';

    try {
      await API.login(username, password);
      Common.toast('登录成功！');

      // 延迟后跳转
      setTimeout(() => {
        const redirect = Common.getParam('redirect') || '../index.html';
        location.href = redirect;
      }, 800);
    } catch (err) {
      Common.toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = '登 录';
    }

    return false;
  }

  // 切换密码显示/隐藏
  function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁';
    }
  }

  // 初始化页面
  function init() {
    Common.initPage();

    // 如果已登录，跳转到首页
    if (API.getCurrentUser()) {
      location.href = '../index.html';
      return;
    }

    // 实时验证
    document.getElementById('loginUsername').addEventListener('blur', validate);
    document.getElementById('loginPassword').addEventListener('blur', validate);
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);

  // 返回公共接口
  return { handleSubmit, togglePassword };
})();
