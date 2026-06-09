/**
 * 注册页面逻辑 - 综合表单验证
 */
const RegisterPage = (() => {
  // 表单验证规则
  const validators = {
    username(v) {
      if (!v) return '请输入用户名';
      if (v.length < 3 || v.length > 20) return '用户名长度为3-20个字符';
      if (!/^[a-zA-Z0-9_一-龥]+$/.test(v)) return '用户名只能包含字母、数字、下划线和中文';
      return '';
    },
    phone(v) {
      if (!v) return '请输入手机号';
      if (!/^1[3-9]\d{9}$/.test(v)) return '请输入正确的11位手机号';
      return '';
    },
    password(v) {
      if (!v) return '请输入密码';
      if (v.length < 6 || v.length > 20) return '密码长度为6-20个字符';
      return '';
    },
    confirm(v) {
      if (!v) return '请确认密码';
      if (v !== document.getElementById('regPassword').value) return '两次密码输入不一致';
      return '';
    }
  };

  // 验证单个字段
  function validateField(id, validatorKey) {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(id + 'Error');
    const msg = validators[validatorKey](input.value.trim());
    if (msg) {
      input.classList.add('error');
      errorEl.textContent = msg;
      errorEl.classList.add('show');
      return false;
    }
    input.classList.remove('error');
    errorEl.classList.remove('show');
    return true;
  }

  // 验证所有字段
  function validateAll() {
    let valid = true;
    valid = validateField('regUsername', 'username') && valid;
    valid = validateField('regPhone', 'phone') && valid;
    valid = validateField('regPassword', 'password') && valid;
    valid = validateField('regConfirm', 'confirm') && valid;

    // 协议勾选验证
    const agreeErr = document.getElementById('regAgreementError');
    if (!document.getElementById('agreeTerms').checked) {
      agreeErr.textContent = '请阅读并同意用户协议';
      agreeErr.classList.add('show');
      valid = false;
    } else {
      agreeErr.classList.remove('show');
    }

    return valid;
  }

  // 处理表单提交
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateAll()) return false;

    const btn = document.getElementById('registerBtn');
    btn.disabled = true;
    btn.textContent = '注册中...';

    try {
      await API.register(
        document.getElementById('regUsername').value.trim(),
        document.getElementById('regPassword').value,
        document.getElementById('regPhone').value.trim()
      );

      Common.toast('注册成功！正在跳转到登录页...');
      setTimeout(() => {
        location.href = 'login.html';
      }, 1200);
    } catch (err) {
      Common.toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = '注 册';
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

    if (API.getCurrentUser()) {
      location.href = '../index.html';
      return;
    }

    // 绑定失焦验证事件
    document.getElementById('regUsername').addEventListener('blur', () => validateField('regUsername', 'username'));
    document.getElementById('regPhone').addEventListener('blur', () => validateField('regPhone', 'phone'));
    document.getElementById('regPassword').addEventListener('blur', () => validateField('regPassword', 'password'));
    document.getElementById('regConfirm').addEventListener('blur', () => validateField('regConfirm', 'confirm'));
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);

  // 返回公共接口
  return { handleSubmit, togglePassword };
})();
