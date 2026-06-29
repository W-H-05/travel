# 绿色旅行小程序

基于微信小程序 + 云开发的智能旅行助手，支持 AI 对话规划行程、路线地图、打卡签到、环保社区等功能。

## 功能特性

- **AI 旅行规划** — 对话式 AI 助手「小绿」，输入目的地+天数+偏好，自动生成详细行程，支持云端 AI 和本地引擎双模式
- **路线地图** — 腾讯地图集成，查看每日行程路线，地点标记与路径规划
- **打卡签到** — 到达景点后打卡获取积分，记录旅行足迹
- **绿色活动** — 参与海滩清理、环保倡议等公益活动赚取积分
- **成就系统** — 完成旅行目标解锁成就徽章
- **社区互动** — 发布旅行动态，点赞评论
- **好友系统** — 好友排行、旅行伙伴

## 技术栈

- **框架**：微信小程序原生开发
- **云服务**：微信云开发（CloudBase）
- **AI 引擎**：火山方舟 API（云端）+ 本地规则引擎
- **地图**：腾讯位置服务 API
- **基础库**：≥ 3.6.4

## 项目结构

```
greentravel-wx/
├── app.js / app.json / app.wxss    # 应用入口与全局配置
├── pages/
│   ├── home/           # 首页
│   ├── category/       # 分类浏览
│   ├── ai/             # AI 助手对话 + 路线地图
│   ├── plan/           # 我的规划
│   ├── profile/        # 个人中心
│   ├── checkin/        # 打卡签到
│   ├── green-travel/   # 绿色活动
│   ├── community/      # 社区
│   ├── detail/         # 活动详情
│   ├── itinerary/      # 行程详情
│   ├── achievements/   # 成就展示
│   ├── ranking/        # 排行榜
│   ├── friends/        # 好友
│   ├── favorites/      # 收藏
│   ├── search/         # 搜索
│   ├── login/          # 登录
│   └── ...
├── cloudfunctions/
│   └── travelAI/       # 云端 AI 对话云函数
├── utils/
│   ├── ai.js           # 本地 AI 引擎（规划生成、意图识别）
│   ├── cloud-ai.js     # 云端 AI 桥接层
│   ├── location.js     # 定位与地理编码
│   ├── store.js        # 数据存储
│   ├── data.js         # 静态数据
│   └── achievement-feedback.js  # 成就弹窗
├── components/
│   └── achievement-popup/  # 成就弹窗组件
├── images/
│   └── tabBar/         # 底部导航图标
└── .gitignore
```

## 效果演示
<img width="255" height="535" alt="Snipaste_2026-06-29_14-16-39" src="https://github.com/user-attachments/assets/100f2251-bb2b-4338-ac26-6bd2c1cfb0ba" />
<img width="255" height="540" alt="44d6907c-c89e-4d51-9392-88b5ef2892d4" src="https://github.com/user-attachments/assets/4d2fab61-e075-4f16-a069-df213fb90623" />
<img width="253" height="535" alt="Snipaste_2026-06-29_14-25-38" src="https://github.com/user-attachments/assets/fabf11a2-d7eb-49db-b7c8-b952bbb72df5" />
<img width="254" height="539" alt="Snipaste_2026-06-29_14-26-34" src="https://github.com/user-attachments/assets/e5e48be0-bf73-4059-bdcc-0a1817e47df8" />
<img width="257" height="538" alt="Snipaste_2026-06-29_14-28-00" src="https://github.com/user-attachments/assets/b189e19c-cab2-49f5-b527-2823706d718f" />
<img width="254" height="537" alt="Snipaste_2026-06-29_14-28-47" src="https://github.com/user-attachments/assets/7368039f-8399-463a-94bc-4ecb3490eff8" />


## 快速开始

### 1. 环境准备

- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册微信小程序并获取 AppID
- 开通微信云开发

### 2. 配置密钥

clone 项目后，复制以下模板文件并填入真实值：

```bash
# 腾讯地图 Key（去 https://lbs.qq.com/ 申请）
cp utils/location-config.example.js utils/location-config.js

# 云开发环境 ID（微信云开发控制台获取）
cp utils/env-config.example.js utils/env-config.js

# 火山方舟 API 配置（去火山方舟控制台获取）
cp cloudfunctions/travelAI/config.example.json cloudfunctions/travelAI/config.json
```

编辑这 3 个文件，填入你的真实 Key：

- `utils/location-config.js` → `QQ_MAP_KEY`
- `utils/env-config.js` → `CLOUD_ENV_ID`
- `cloudfunctions/travelAI/config.json` → `API_KEY`、`ENDPOINT_ID`

### 3. 开始开发

1. 微信开发者工具 → 导入项目
2. 填写 AppID
3. 上传云函数：右键 `cloudfunctions/travelAI` → 上传并部署

## 核心依赖

| 服务 | 用途 | 获取地址 |
|------|------|----------|
| 微信云开发 | 数据存储、云函数 | 微信公众平台 |
| 腾讯位置服务 | 地图、地理编码、路线规划 | [lbs.qq.com](https://lbs.qq.com/) |
| 火山方舟 | 云端 AI 大模型对话 | [console.volcengine.com](https://console.volcengine.com/) |

## License

MIT
