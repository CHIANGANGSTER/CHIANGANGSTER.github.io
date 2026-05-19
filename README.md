# CHIANGANGSTER.github.io

个人工作内容展示与 AIGC 图像处理教程网站，基于 GitHub Pages 托管。

🔗 **在线访问**: https://chiangangster.github.io/

## 网站内容

### 主页 (index.html)
- 3D 椅子模型自转展示（WebGL/Three.js）
- MatCap 材质渲染
- 滚动驱动旋转 + 鼠标拖拽交互
- 液体扭曲后处理着色器

### 教程页面 (tutorial.html)
详细的 AI 图像处理工作流教程：

- **COMPLIANCE** - 生产合规与模型授权说明
- **影像重构逻辑** - 基于 Flux.2 的编辑范式
- **01. 核心架构逻辑总览** - Master Workflow Architecture
- **02. 七步精修法** - Seven-Step Refinement Workflow，全模块图片已应用 Magic Bento 边框 Spotlight 效果
- **02. 双文本编码器深度解析** - Dual Text Encoder Deep Dive
- **03. LoRA 的应用** - 不同 Weight 参数对生成效果的影响
- **04. 效率与模式选择** - 快速模式 vs 商业模式的对比
- **05. 物理保真度深度解析** - 布料、橡胶、金属等材质的真实感处理，已应用 Magic Bento 边框 Spotlight 效果；新增通用精修提示词参考模块（T5XXL 主提示词 + CLIP_L 画风提示词）
- **06. 实战路径** - 从白模到商业成品的完整流程
- **THANKS FOR WATCHING** - 滚动揭示动画

### 工作流页面 (workflows/)
- ComfyUI 工作流展示
- Flux.2 产品精修完整工作流

### 其他内容
- **prompts/** - 提示词收藏
- **research/** - 研究笔记
- **marketing/** - 营销素材
- **resources/** - 资源导航
- **about/** - 关于页面

## 本地预览

本项目是无构建工具的静态站点，但页面使用了 `/assets/...` 绝对路径和 `fetch()` 加载 JSON 数据。请通过本地 HTTP server 访问，不建议直接双击或用 `file://` 打开 `index.html`，否则资源路径、搜索弹窗或数据加载可能失败。

```bash
# 方法1：使用 Python 本地服务器
python -m http.server 8080
# 然后访问 http://localhost:8080

# 方法2：使用 Node.js 静态服务器
npx serve .

# 方法3：使用 VS Code Live Server
```

## 关于

本项目用于展示个人工作内容及 AI 生成图像处理的工作流与技巧，适用于产品精修、商业摄影后期等领域。
