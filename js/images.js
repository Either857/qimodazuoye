/**
 * 商品图片生成器 - 创建样式化的SVG商品图片
 */
const ProductImages = (() => {
  // 分类主题配置
  const categoryThemes = {
    1: { bg1: '#1a1a2e', bg2: '#16213e', accent: '#0f3460', text: '#e94560' },  // 数码
    2: { bg1: '#2d3436', bg2: '#636e72', accent: '#0984e3', text: '#74b9ff' },  // 电脑
    3: { bg1: '#2d3436', bg2: '#636e72', accent: '#00b894', text: '#55efc4' },  // 家电
    4: { bg1: '#6c5ce7', bg2: '#a29bfe', accent: '#fd79a8', text: '#fff' },     // 服饰
    5: { bg1: '#e17055', bg2: '#fab1a0', accent: '#d63031', text: '#fff' },     // 美妆
    6: { bg1: '#00b894', bg2: '#55efc4', accent: '#00cec9', text: '#fff' },     // 食品
    7: { bg1: '#0984e3', bg2: '#74b9ff', accent: '#6c5ce7', text: '#fff' },     // 运动
    8: { bg1: '#fdcb6e', bg2: '#ffeaa7', accent: '#e17055', text: '#d63031' }   // 文具
  };

  // 生成商品卡片SVG图片
  function generateSVG(product, width = 400, height = 400) {
    const theme = categoryThemes[product.category] || categoryThemes[1];
    const emoji = product.image;
    const name = product.name.length > 12 ? product.name.substring(0, 12) + '...' : product.name;
    const price = '¥' + product.price.toFixed(0);
    const discount = Math.round((1 - product.price / product.originalPrice) * 100);

    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${theme.bg1}"/>
      <stop offset="100%" style="stop-color:${theme.bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" style="stop-color:${theme.accent};stop-opacity:0.4"/>
      <stop offset="100%" style="stop-color:${theme.bg1};stop-opacity:0"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" rx="12"/>
  <circle cx="${width/2}" cy="${height*0.4}" r="${height*0.28}" fill="url(#glow)"/>
  <text x="${width/2}" y="${height*0.45}" text-anchor="middle" font-size="${height*0.25}" filter="url(#shadow)">${emoji}</text>
  <text x="${width/2}" y="${height*0.7}" text-anchor="middle" font-size="${Math.min(width*0.045, 18)}" fill="${theme.text}" font-family="system-ui,sans-serif" font-weight="600" opacity="0.95">${escapeXml(name)}</text>
  <rect x="${width*0.25}" y="${height*0.78}" width="${width*0.5}" height="1" fill="${theme.text}" opacity="0.2"/>
  <text x="${width*0.35}" y="${height*0.88}" text-anchor="middle" font-size="${Math.min(width*0.05, 20)}" fill="#ff6b6b" font-family="system-ui,sans-serif" font-weight="800">${price}</text>
  <rect x="${width*0.58}" y="${height*0.83}" width="${width*0.15}" height="${height*0.07}" rx="4" fill="#ff4757"/>
  <text x="${width*0.655}" y="${height*0.875}" text-anchor="middle" font-size="${Math.min(width*0.032, 13)}" fill="#fff" font-family="system-ui,sans-serif" font-weight="700">-${discount}%</text>
</svg>`)}`;
  }

  // 生成商品详情页SVG图片
  function generateDetailSVG(product, width = 500, height = 500) {
    const theme = categoryThemes[product.category] || categoryThemes[1];
    const emoji = product.image;

    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="dbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${theme.bg1}"/>
      <stop offset="100%" style="stop-color:${theme.bg2}"/>
    </linearGradient>
    <radialGradient id="dglow" cx="50%" cy="50%" r="45%">
      <stop offset="0%" style="stop-color:${theme.accent};stop-opacity:0.5"/>
      <stop offset="100%" style="stop-color:${theme.bg1};stop-opacity:0"/>
    </radialGradient>
    <filter id="dshadow">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#dbg)" rx="16"/>
  <circle cx="${width/2}" cy="${height/2}" r="${height*0.32}" fill="url(#dglow)"/>
  <text x="${width/2}" y="${height*0.55}" text-anchor="middle" font-size="${height*0.3}" filter="url(#dshadow)">${emoji}</text>
</svg>`)}`;
  }

  // 转义XML特殊字符
  function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // 生成商品图片HTML
  function productImageHTML(product, size = 'card') {
    if (size === 'detail') {
      const src = generateDetailSVG(product);
      return `<img src="${src}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`;
    }
    if (size === 'thumb') {
      const src = generateSVG(product, 80, 80);
      return `<img src="${src}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`;
    }
    const src = generateSVG(product);
    return `<img src="${src}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover">`;
  }

  return { generateSVG, generateDetailSVG, productImageHTML };
})();
