# Hello World · Interactive Experiment

从一声 Hello，到无限可能。一个独立、响应式的 Hello World 展示页面。

## 打开前端

直接用浏览器打开 `index.html`，无需安装依赖。也可以在此目录启动本地服务器：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 交互

- 在 Python、JavaScript、Go 之间切换，查看对应的 Hello World 代码。
- 修改名字，实时更新代码；支持中文、引号和特殊字符。
- 点击「运行 Hello」或按 Ctrl/⌘ + Enter，在浏览器演示输出问候。
- 复制当前代码，粘贴到对应语言环境中实际运行。
- Canvas 线框地球动画、手机适配、键盘导航及减少动态效果设置。

页面的运行按钮是浏览器内的输出演示，不会执行 Python、Go 或任意输入的程序。代码展示使用安全的文本节点；没有外部依赖、统计脚本或远程资源请求。

## 原始 Python 程序

```bash
python hello.py
```

输出：

```text
Hello, World!
```

## 文件

- `index.html`：页面结构
- `styles.css`：响应式视觉样式
- `app.js`：交互与 Canvas 动画
- `hello.py`：原始 Python Hello World

## GitHub Pages

如需公开站点，可在仓库 Settings → Pages 中选择从 `main` 分支的根目录部署。仓库中的 HTML 源码页面本身不是已部署的网站。
