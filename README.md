# 像素风经典游戏合集

> 一个使用 HTML5 + CSS3 + 原生 JavaScript 编写的网页版经典小游戏集合。将童年回忆装进浏览器，随时随地点开即玩！

## 在线体验

将本项目部署到任意静态资源服务（如 GitHub Pages、Vercel、Netlify）即可在线游玩。若你只想在本地快速体验，请看下方"本地运行"。

## 项目亮点

- **零依赖**：全部使用原生 Web 技术实现，不依赖任何第三方框架。
- **经典玩法**：内置 8 款耳熟能详的小游戏，操作简单却富有乐趣。
- **响应式设计**：支持桌面端与移动端浏览。
- **本地存档**：部分游戏支持 `localStorage` 记分板，刷新页面成绩也不丢失。
- **可扩展**：遵循"一页一游戏、一脚本"设计，方便后续添加新游戏。

## 目录结构

```
.
├── index.html              # 游戏大厅首页
├── css/
│   ├── style.css           # 首页及通用样式
│   └── games.css           # 各游戏公共样式
├── games/
│   ├── 2048.html
│   ├── breakout.html
│   ├── flappybird.html
│   ├── gomoku.html
│   ├── minesweeper.html
│   ├── pacman.html
│   ├── snake.html
│   ├── tetris.html
│   └── js/                 # 各游戏脚本
│       ├── 2048.js
│       ├── breakout.js
│       ├── flappybird.js
│       ├── gomoku.js
│       ├── minesweeper.js
│       ├── pacman.js
│       ├── snake.js
│       └── tetris.js
└── README.md
```

## 支持的游戏及操作

| 游戏 | 玩法简介 | 键盘/鼠标操作 |
| ---- | -------- | ------------- |
| 贪吃蛇 Snake | 控制蛇吃食物，避免碰撞自身或边界 | 方向键 / WASD |
| 五子棋 Gomoku | 玩家与 AI 对战，先连成五子胜 | 鼠标点击落子 |
| 扫雷 Minesweeper | 找出所有雷区 | 左键翻格、右键插旗 |
| 俄罗斯方块 Tetris | 消除完整横行得分 | ← → 移动，↑ 旋转，↓ 加速，空格快速下落 |
| 打砖块 Breakout | 反弹小球击碎所有砖块 | 鼠标移动挡板 |
| 2048 | 合并数字方块得到 2048 | 方向键 / WASD |
| Flappy Bird | 操控小鸟穿越管道 | 空格 / 鼠标点击 |
| 吃豆人 Pac-Man | 吃完豆子躲避鬼怪 | 方向键 |

## 本地运行

1. 克隆仓库  
   ```bash
   git clone <repo-url>
   cd game-collection
   ```
2. 启动本地静态服务器（任选其一）  
   - 使用 Node.js  
     ```bash
     npx http-server -c-1
     ```  
   - 使用 Python  
     ```bash
     python -m http.server 8080
     ```  
3. 浏览器访问 `http://localhost:8080` 即可。

如果你不想启动服务器，也可以直接双击 `index.html`，但因浏览器同源策略，个别游戏的 `localStorage` 记分板在 `file://` 协议下可能无法正常保存。

## 开发

1. 每个游戏都有独立的 HTML + JS 文件，互不依赖，改动不影响其他游戏。
2. 推荐使用 VS Code + Live Server 插件进行热更新调试。
3. 如需新增游戏，只需在 `games` 目录中新增 `xxx.html` + `js/xxx.js`，并在 `index.html` 的游戏网格中添加入口。

## 技术栈

- HTML5 Canvas / DOM
- CSS3 Flexbox & Grid 响应式布局
- 原生 JavaScript (ES6+)
- LocalStorage 持久化得分

## TODO

- 增加移动端触控手势优化  
- 为每款游戏加入声音效果  
- 改善 AI 算法（五子棋）  
- Dark Mode / 夜间主题

## 许可协议

MIT License — 欢迎自由 Fork & Star，如有建议欢迎 Issue 或 PR！

---

祝游戏愉快 🎮