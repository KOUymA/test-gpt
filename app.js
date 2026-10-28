'use strict';

const recipient = document.querySelector('#recipient');
const codeContent = document.querySelector('#code-content');
const output = document.querySelector('#terminal-output');
const runButton = document.querySelector('#run-button');
const tabs = [...document.querySelectorAll('.tab')];
let language = 'python';
let runs = 0;
let toastTimer;
let copyTimer;

const languages = {
  python: {file: 'hello.py', comment: '# 每一段旅程，都有一个起点。', code: value => `print(${JSON.stringify(value)})`, tokens: value => [['function', 'print'], ['', '('], ['string', JSON.stringify(value)], ['', ')']]},
  javascript: {file: 'hello.js', comment: '// 用一声问候，打开新的可能。', code: value => `console.log(${JSON.stringify(value)});`, tokens: value => [['', 'console.'], ['function', 'log'], ['', '('], ['string', JSON.stringify(value)], ['', ');']]},
  go: {file: 'hello.go', comment: '// 世界很大，勇敢出发。', code: value => `package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println(${JSON.stringify(value)})\n}`, tokens: value => [['keyword', 'package'], ['', ' main\n\n'], ['keyword', 'import'], ['', ' '], ['string', '"fmt"'], ['', '\n\n'], ['keyword', 'func'], ['', ' main() {\n  fmt.'], ['function', 'Println'], ['', '('], ['string', JSON.stringify(value)], ['', ')\n}']]}
};

function greeting() { return `Hello, ${recipient.value.trim() || 'World'}!`; }
function renderCode() {
  const config = languages[language];
  codeContent.replaceChildren(...config.tokens(greeting()).map(([type, text]) => {
    const span = document.createElement('span');
    if (type) span.className = `syntax-${type}`;
    span.textContent = text;
    return span;
  }));
  document.querySelector('#filename').textContent = config.file;
  document.querySelector('#code-comment').textContent = config.comment;
  document.querySelector('#line-numbers').textContent = config.code(greeting()).split('\n').map((_, i) => i + 1).join('\n');
}
function selectLanguage(tab) {
  language = tab.dataset.language;
  tabs.forEach(item => {
    const selected = item === tab;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#editor-panel').setAttribute('aria-labelledby', tab.id);
  renderCode();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectLanguage(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectLanguage(tabs[next]);
    tabs[next].focus();
  });
});
recipient.addEventListener('input', renderCode);

function showToast(text) {
  const toast = document.querySelector('#toast');
  toast.textContent = text;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
}
document.querySelector('#copy-button').addEventListener('click', async () => {
  const text = languages[language].code(greeting());
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const field = document.createElement('textarea');
      field.value = text;
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(field);
      field.select();
      const success = document.execCommand('copy');
      field.remove();
      document.querySelector('#copy-button').focus();
      if (!success) throw new Error('Clipboard unavailable');
    }
    document.querySelector('#copy-label').textContent = '已复制';
    showToast('代码已复制，去创造点什么吧。');
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { document.querySelector('#copy-label').textContent = '复制'; }, 2000);
  } catch { showToast('浏览器未允许复制，请选中代码后手动复制。'); }
});
runButton.addEventListener('click', () => {
  if (runButton.disabled) return;
  const value = greeting();
  const file = languages[language].file;
  runButton.disabled = true;
  document.querySelector('#run-label').textContent = '正在问候…';
  document.querySelector('#console-status').textContent = '运行中';
  setTimeout(() => {
    runs += 1;
    const meta = document.createElement('div');
    meta.className = 'output-meta';
    meta.textContent = `› ${file} · ${new Date().toLocaleTimeString('zh-CN', {hour12: false})}`;
    const line = document.createElement('div');
    line.className = 'output-line';
    line.textContent = value;
    const note = document.createElement('div');
    note.className = 'output-note';
    note.textContent = '✓ 问候已送达屏幕。下一步，由你定义。';
    output.replaceChildren(meta, line, note);
    document.querySelector('#console-status').textContent = '演示完成 ✓';
    document.querySelector('#run-counter').textContent = `${String(runs).padStart(3, '0')} HELLO${runs > 1 ? 'S' : ''} SENT ↗`;
    document.querySelector('#globe-greeting').textContent = value;
    document.querySelector('#globe-greeting').style.fontSize = value.length > 20 ? '14px' : '';
    document.querySelector('#globe-greeting').style.letterSpacing = value.length > 20 ? '1px' : '';
    document.querySelector('#run-label').textContent = '再说一声 Hello';
    runButton.disabled = false;
  }, 450);
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    runButton.click();
  }
});
renderCode();

// Native canvas keeps the globe self-contained: no network assets or graphics dependencies.
const canvas = document.querySelector('#globe');
const ctx = canvas.getContext('2d');
if (ctx) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, rotation = .45, lastTime = 0, visible = true;
  let animationId = 0;
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio; canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  function project(lat, lon, radius) {
    const x = Math.cos(lat) * Math.cos(lon + rotation);
    const y = Math.sin(lat);
    const z = Math.cos(lat) * Math.sin(lon + rotation);
    const tilt = -.24;
    return {x: width / 2 + (x * Math.cos(tilt) - y * Math.sin(tilt)) * radius, y: height / 2 + (x * Math.sin(tilt) + y * Math.cos(tilt)) * radius, z};
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const radius = Math.min(width * .43, height * .38);
    for (let lat = -75; lat <= 75; lat += 15) {
      for (let lon = 0; lon < 360; lon += 4) segment(lat * Math.PI / 180, lon * Math.PI / 180, lat * Math.PI / 180, (lon + 4) * Math.PI / 180, radius);
    }
    for (let lon = 0; lon < 360; lon += 15) {
      for (let lat = -90; lat < 90; lat += 4) segment(lat * Math.PI / 180, lon * Math.PI / 180, (lat + 4) * Math.PI / 180, lon * Math.PI / 180, radius);
    }
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-.38);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.19, radius * .31, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#c4d79640'; ctx.lineWidth = .7; ctx.stroke();
    const angle = rotation * 1.4;
    const dx = Math.cos(angle) * radius * 1.19, dy = Math.sin(angle) * radius * .31;
    ctx.shadowBlur = 20; ctx.shadowColor = '#ff805b';
    ctx.fillStyle = '#ff805b'; ctx.beginPath(); ctx.arc(dx, dy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    [[.55, 1.1], [-.4, 2.8], [.1, 5.1]].forEach(([lat, lon]) => {
      const p = project(lat, lon, radius);
      if (p.z < 0) return;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fillStyle = '#c7d7a5'; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.strokeStyle = '#c7d7a530'; ctx.stroke();
    });
  }
  function segment(lat, lon, nextLat, nextLon, radius) {
    const p = project(lat, lon, radius), q = project(nextLat, nextLon, radius);
    const opacity = .055 + Math.max(0, (p.z + q.z) / 2) * .23;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
    ctx.strokeStyle = `rgba(183, 205, 143, ${opacity})`; ctx.lineWidth = .65; ctx.stroke();
  }
  function animate(time) {
    animationId = 0;
    if (!visible || media.matches || document.hidden) { lastTime = 0; return; }
    if (lastTime) rotation += Math.min(time - lastTime, 100) * .00007;
    lastTime = time;
    draw();
    animationId = requestAnimationFrame(animate);
  }
  function start() { if (!animationId && !media.matches && visible && !document.hidden) animationId = requestAnimationFrame(animate); }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); }).observe(canvas);
  media.addEventListener('change', () => { draw(); start(); });
  document.addEventListener('visibilitychange', start);
  resize(); start();
}
