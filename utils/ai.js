const { destinations, clone } = require('./data');

// ==================== 目的地关键词映射 ====================

const destinationHints = [
  { id: '1', keywords: ['黄山', '安徽黄山', '爬山', '山岳'] },
  { id: '2', keywords: ['九寨沟', '阿坝', '彩林'] },
  { id: '3', keywords: ['阳朔', '桂林', '西街', '漓江'] },
  { id: '4', keywords: ['鼓浪屿', '厦门', '海岛', '文艺海边'] },
  { id: '5', keywords: ['丽江', '古城', '云南古城'] },
  { id: '6', keywords: ['张家界', '森林公园', '奇峰'] },
  { id: '7', keywords: ['三亚', '亚龙湾', '海边度假', '沙滩'] },
  { id: '8', keywords: ['故宫', '北京', '皇城', '博物馆'] },
  { id: '9', keywords: ['敦煌', '莫高窟', '沙漠', '丝路'] },
  { id: '10', keywords: ['黄果树', '瀑布', '安顺'] },
  { id: '11', keywords: ['稻城', '亚丁', '川西', '雪山草甸'] },
  { id: '12', keywords: ['乌镇', '江南水乡', '水乡古镇'] },
  { id: '13', keywords: ['长白山', '天池', '东北'] },
  { id: '14', keywords: ['布达拉宫', '拉萨', '西藏'] },
  { id: '15', keywords: ['西双版纳', '热带雨林', '版纳'] },
  { id: '16', keywords: ['青海湖', '青海', '环湖'] },
  { id: '17', keywords: ['平遥', '晋中', '山西古城'] },
  { id: '18', keywords: ['武夷山', '丹霞', '福建山水'] },
  { id: '19', keywords: ['峨眉山', '乐山', '佛教名山'] },
  { id: '20', keywords: ['呼伦贝尔', '草原', '露营'] }
];

const themeFallbacks = [
  { id: '7', keywords: ['海边', '海岛', '看海', '沙滩', '海湾', '滨海'] },
  { id: '12', keywords: ['古镇', '古城', '水乡', '老街'] },
  { id: '10', keywords: ['瀑布'] },
  { id: '15', keywords: ['雨林', '热带', '植物园'] },
  { id: '20', keywords: ['草原', '露营', '营地'] },
  { id: '8', keywords: ['博物馆', '历史', '古迹', '皇城', '展馆'] },
  { id: '6', keywords: ['森林', '徒步', '轻徒步'] },
  { id: '16', keywords: ['湖', '环湖', '公路旅行'] },
  { id: '3', keywords: ['美食', '夜市', '夜景', 'citywalk', '城市漫步'] }
];

// ==================== 场景预设 ====================

const categoryScenes = {
  自然风光: {
    spots: ['核心观景平台', '轻徒步步道', '日落视野点'],
    food: '景区外口碑稳定的小馆',
    night: '安静观星或回酒店休息'
  },
  海滨度假: {
    spots: ['海岸步道', '沙滩取景点', '傍晚海湾'],
    food: '海边餐吧或海鲜排档',
    night: '海风夜景散步'
  },
  古镇之旅: {
    spots: ['老街主轴', '桥边水巷', '夜游灯光段'],
    food: '本地老店和小吃铺',
    night: '夜色最好的河岸或古街'
  },
  名胜古迹: {
    spots: ['核心主景区', '馆藏展线', '建筑轴线取景位'],
    food: '景区周边在地风味餐厅',
    night: '文化街区夜游'
  },
  森林公园: {
    spots: ['林间栈道', '制高点观景区', '溪谷步道'],
    food: '山脚农家菜或轻食店',
    night: '回住处放松恢复体力'
  },
  沙漠探险: {
    spots: ['主观景区', '沙丘体验点', '日落机位'],
    food: '西北风味餐厅',
    night: '观星或夜游营地'
  },
  壮丽瀑布: {
    spots: ['瀑布主观景台', '近景步道', '周边少人机位'],
    food: '瀑布景区外特色餐馆',
    night: '小镇闲逛'
  },
  魅力城市: {
    spots: ['城市代表街区', '历史街巷', '夜景机位'],
    food: '本地人常去的美食街',
    night: '河边或高处看城市灯光'
  },
  野外露营: {
    spots: ['草原观景点', '营地附近步道', '落日草坡'],
    food: '露营简餐或地方风味',
    night: '星空和篝火氛围'
  }
};

// ==================== 兴趣/节奏/预算标签 ====================

const interestTexts = {
  photo: {
    morning: '把清晨黄金光线留给最佳机位，先拍一组宽阔场景照',
    noon: '安排一处构图更干净的小众角度，补几张细节和人物照',
    evening: '傍晚去视野最开阔的位置等日落，顺手拍夜色氛围照'
  },
  food: {
    morning: '找一家当地人常去的早餐铺，先把这座城市的烟火气吃进来',
    noon: '午餐优先挑本地招牌菜，避开只做游客生意的网红店',
    evening: '晚上留给夜市或人气小馆，把特色小吃补齐'
  },
  culture: {
    morning: '穿插一段文化体验，比如展馆、历史街区或手作小店',
    noon: '留出时间看看当地生活方式和建筑细节，不要只赶路',
    evening: '夜里选一段更有地方气质的老街慢慢走'
  },
  relax: {
    morning: '节奏放慢一点，别把景点排得过密，给自己留出发呆时间',
    noon: '午后安排一间景观咖啡馆或舒服的休息点',
    evening: '晚上尽量轻松收尾，留一点时间散步或早点回住处'
  },
  hike: {
    morning: '体力最好的时段留给步道或轻徒步线路',
    noon: '中途补水和休息点要提前看好，避免行程过满',
    evening: '傍晚选一段强度更低的观景路线收尾'
  },
  family: {
    morning: '优先走亲子友好、步行压力小的线路，减少来回折返',
    noon: '午餐和休息时间安排得宽松一点，别让节奏过赶',
    evening: '晚上以轻松散步或早点回酒店为主'
  },
  night: {
    morning: '白天重点踩点，顺手记下夜景最好的拍摄位置',
    noon: '把体力留给晚上的重头戏，午后别排太满',
    evening: '把夜景、夜游和夜市留到最后，体验会更完整'
  }
};

const interestLabels = {
  photo: '拍照',
  food: '美食',
  culture: '文化体验',
  relax: '轻松度假',
  hike: '徒步',
  family: '亲子',
  night: '夜景'
};

const paceLabels = {
  fast: '高效节奏',
  balanced: '均衡节奏',
  slow: '慢游节奏'
};

const budgetLabels = {
  low: '低预算',
  medium: '均衡预算',
  high: '品质预算'
};

// ==================== 预算数据 ====================

const accommodationBudgetByLevel = {
  low: [180, 320],
  medium: [320, 620],
  high: [680, 1380]
};

const foodBudgetByLevel = {
  low: [100, 160],
  medium: [160, 280],
  high: [280, 480]
};

const localMoveBudgetByLevel = {
  low: [40, 90],
  medium: [80, 160],
  high: [150, 260]
};

const ticketBudgetByCategory = {
  自然风光: [120, 320],
  海滨度假: [40, 180],
  古镇之旅: [40, 180],
  名胜古迹: [80, 260],
  森林公园: [80, 240],
  沙漠探险: [100, 280],
  壮丽瀑布: [80, 220],
  魅力城市: [20, 120],
  野外露营: [80, 240]
};

const transportBudgetByMode = {
  flight: {
    low: [700, 1200],
    medium: [1000, 1800],
    high: [1600, 3200]
  },
  rail: {
    low: [260, 520],
    medium: [420, 820],
    high: [760, 1400]
  },
  local: {
    low: [60, 160],
    medium: [120, 260],
    high: [220, 500]
  }
};

const paceTimeSlots = {
  fast: ['08:00', '10:00', '12:30', '15:00', '18:30'],
  balanced: ['09:00', '11:00', '13:30', '15:30', '18:30'],
  slow: ['09:30', '11:30', '14:00', '16:30', '19:00']
};

/**
 * 生成灵活时间槽 —— 不再固定死板的时间点
 * 根据节奏和随机种子，每次生成不同的连贯时间
 * @param {string} pace - 节奏: fast | balanced | slow
 * @param {number} dayIndex - 第几天，用于生成不同种子
 * @returns {string[]} 5 个 HH:MM 格式的时间
 */
function generateFlexibleTimeSlots(pace, dayIndex) {
  const seed = dayIndex || 0;
  const rand = (i) => {
    // 简单的伪随机：基于种子和索引，产生 0-1 之间的值
    const x = Math.sin(seed * 3.7 + i * 2.3) * 10000;
    return x - Math.floor(x);
  };

  const configs = {
    fast:    { startH: 7.5, endH: 19, gaps: [1.5, 1.5, 2, 2], count: 5 },
    balanced:{ startH: 8.5, endH: 19, gaps: [2, 2, 2.5, 2.5], count: 5 },
    slow:    { startH: 9, endH: 19.5, gaps: [2.5, 2.5, 3, 2.5], count: 5 }
  };

  const cfg = configs[pace] || configs.balanced;
  const slots = [];
  let currentH = cfg.startH + rand(0) * 0.8; // 开始时间 ± ~50 分钟浮动

  for (let i = 0; i < cfg.count; i++) {
    const h = Math.floor(currentH);
    const m = Math.floor((currentH - h) * 60);
    const mm = Math.round(m / 5) * 5; // 对齐到 5 分钟
    slots.push(
      (h < 10 ? '0' + h : '' + h) + ':' + (mm < 10 ? '0' + mm : '' + mm)
    );
    // 下一个时间 = 当前 + 间隔 + 随机浮动（最后一个不需要计算）
    if (i < cfg.gaps.length) {
      currentH += cfg.gaps[i] + rand(i + 1) * 0.6 - 0.3;
    }
  }

  return slots;
}

function getTimeSlots(profile, dayIndex) {
  const pace = profile.pace || 'balanced';
  return generateFlexibleTimeSlots(pace, dayIndex || 0);
}

const stageLabels = ['启程', '深入', '高光', '慢收', '加码'];

const focusTitleBank = {
  photo: ['黄金光线拍摄', '小众机位慢逛', '日落与夜景收尾'],
  food: ['在地味道巡游', '老街小吃路线', '夜市加餐收尾'],
  culture: ['人文街区走读', '在地文化体验', '历史气质收尾'],
  relax: ['松弛感度假', '咖啡与散步', '轻松收尾'],
  hike: ['轻徒步观景', '步道与制高点', '日落登高收尾'],
  family: ['亲子友好节奏', '互动体验安排', '不赶路收尾'],
  night: ['白天踩点夜里出片', '灯光与夜色', '夜游主场']
};

// ==================== 目的地指南库 ====================

const destinationGuideBank = [
  {
    aliases: ['海南', '三亚', '亚龙湾'],
    region: '海南 · 三亚',
    morningSpots: ['亚龙湾', '太阳湾', '小东海', '椰梦长廊'],
    photoSpots: ['半山半岛帆船港', '后海村', '鹿回头风景区', '天涯海角'],
    foodSpots: ['第一市场', '商品街', '亿恒夜市', '解放路步行街'],
    cultureSpots: ['南山文化旅游区', '三亚千古情', '天涯小镇'],
    relaxSpots: ['大东海旅游区', '三亚湾', '海棠湾'],
    hikeSpots: ['亚龙湾热带天堂森林公园', '鹿回头风景区', '临春岭森林公园'],
    familySpots: ['蜈支洲岛', '三亚亚特兰蒂斯', '水稻国家公园'],
    nightSpots: ['椰梦长廊', '后海村', '第一市场夜市', '解放路步行街']
  },
  {
    aliases: ['云南', '大理', '丽江'],
    region: '云南 · 大理/丽江',
    morningSpots: ['大理古城', '洱海', '龙龛码头', '丽江古城'],
    photoSpots: ['双廊古镇', '喜洲古镇', '玉龙雪山', '束河古镇'],
    foodSpots: ['大理古城人民路', '丽江古城四方街', '忠义市场', '洋人街'],
    cultureSpots: ['崇圣寺三塔', '周城扎染', '木府'],
    relaxSpots: ['洱海生态廊道', '丽江古城', '拉市海'],
    hikeSpots: ['苍山', '玉龙雪山', '虎跳峡'],
    familySpots: ['洱海公园', '丽江古城', '束河古镇'],
    nightSpots: ['大理古城', '丽江古城', '双廊古镇', '人民路']
  },
  {
    aliases: ['厦门', '鼓浪屿'],
    region: '福建 · 厦门',
    morningSpots: ['鼓浪屿', '环岛路', '沙坡尾'],
    photoSpots: ['鼓浪屿', '沙坡尾', '双子塔', '华新路'],
    foodSpots: ['中山路步行街', '第八市场', '曾厝垵', '沙坡尾'],
    cultureSpots: ['鼓浪屿', '沙坡尾艺术西区', '集美学村'],
    relaxSpots: ['环岛路', '鼓浪屿', '沙坡尾'],
    hikeSpots: ['鼓浪屿', '万石植物园', '仙岳山'],
    familySpots: ['鼓浪屿', '厦门园林植物园', '环岛路'],
    nightSpots: ['中山路', '环岛路', '沙坡尾']
  },
  {
    aliases: ['北京', '故宫'],
    region: '北京',
    morningSpots: ['故宫', '景山公园', '南锣鼓巷'],
    photoSpots: ['故宫', '角楼', '南锣鼓巷', '颐和园'],
    foodSpots: ['护国寺小吃', '簋街', '南锣鼓巷', '牛街'],
    cultureSpots: ['国家博物馆', '首都博物馆', '798艺术区'],
    relaxSpots: ['什刹海', '北海公园', '三里屯'],
    hikeSpots: ['景山公园', '北海公园', '奥林匹克森林公园'],
    familySpots: ['北京动物园', '中国科技馆', '颐和园'],
    nightSpots: ['什刹海', '南锣鼓巷', '三里屯', '蓝色港湾']
  },
  {
    aliases: ['苏州'],
    region: '江苏 · 苏州',
    morningSpots: ['平江路', '拙政园', '金鸡湖'],
    photoSpots: ['平江路', '山塘街', '拙政园', '金鸡湖'],
    foodSpots: ['观前街', '山塘街', '平江路', '十全街'],
    cultureSpots: ['苏州博物馆', '拙政园', '狮子林'],
    relaxSpots: ['平江路', '金鸡湖', '独墅湖'],
    hikeSpots: ['金鸡湖', '虎丘', '天平山'],
    familySpots: ['苏州乐园', '金鸡湖', '平江路'],
    nightSpots: ['山塘街', '金鸡湖', '平江路']
  },
  {
    aliases: ['成都'],
    region: '四川 · 成都',
    morningSpots: ['人民公园', '宽窄巷子', '望平街'],
    photoSpots: ['宽窄巷子', '人民公园', '锦里', '东郊记忆'],
    foodSpots: ['建设路', '玉林路', '奎星楼街', '锦里'],
    cultureSpots: ['武侯祠', '杜甫草堂', '金沙遗址'],
    relaxSpots: ['人民公园', '望江楼公园', '太古里'],
    hikeSpots: ['青城山', '都江堰', '锦江绿道'],
    familySpots: ['成都大熊猫繁育研究基地', '锦里', '人民公园'],
    nightSpots: ['九眼桥', '太古里', '锦里', '玉林路']
  },
  {
    aliases: ['呼伦贝尔', '草原'],
    region: '内蒙古 · 呼伦贝尔',
    morningSpots: ['莫日格勒河', '额尔古纳湿地', '呼伦湖'],
    photoSpots: ['莫日格勒河', '额尔古纳湿地', '边境公路', '白桦林'],
    foodSpots: ['海拉尔', '额尔古纳', '满洲里', '黑山头'],
    cultureSpots: ['室韦', '恩和', '满洲里'],
    relaxSpots: ['黑山头', '恩和', '额尔古纳'],
    hikeSpots: ['额尔古纳湿地', '莫日格勒河', '白桦林'],
    familySpots: ['黑山头', '满洲里', '海拉尔'],
    nightSpots: ['黑山头', '满洲里', '海拉尔']
  },
  {
    aliases: ['青海湖'],
    region: '青海 · 青海湖',
    morningSpots: ['青海湖', '二郎剑', '茶卡盐湖'],
    photoSpots: ['青海湖', '茶卡盐湖', '环湖公路', '金银滩草原'],
    foodSpots: ['西宁', '青海湖', '刚察', '茶卡镇'],
    cultureSpots: ['塔尔寺', '日月山', '原子城'],
    relaxSpots: ['青海湖', '茶卡盐湖', '祁连山草原'],
    hikeSpots: ['青海湖', '祁连山', '卓尔山'],
    familySpots: ['青海湖', '西宁', '茶卡盐湖'],
    nightSpots: ['青海湖', '西宁', '茶卡盐湖']
  }
];

// ==================== 忽略词表 ====================

const ignoredDestinationTokens = [
  '帮我', '规划', '安排', '生成', '做个', '推荐', '一下', '一份', '一个',
  '旅行', '旅游', '行程', '攻略', '路线', '怎么', '怎么玩', '自由行', '周末', '假期',
  '预算', '低预算', '高预算', '省钱', '穷游', '品质',
  '拍照', '摄影', '出片', '美食', '夜景', '夜游', '夜拍',
  '文化', '博物馆', '古迹', '展馆', '历史',
  '放松', '度假', '酒店', '咖啡', '躺平',
  '徒步', '登山', '爬山', '步道', '露营',
  '亲子', '孩子', '小朋友', '带娃', '情侣',
  '小众', '冷门', '适合', '想去', '想玩', '打算去', '准备去', '我想去',
  '去', '到', '在', '地方', '目的地', '景点', '哪里', '哪儿',
  '求推荐', '推荐我', '问一下', '告诉我',
  '慢游', '轻松', '休闲', '高效', '特种兵', '暴走', '高强度',
  '看海', '看日出', '看日落', '打卡', '适不适合'
];

// ==================== 必备物品知识库 ====================

const seasonMap = {
  spring: { label: '春季（3-5月）', months: [3, 4, 5] },
  summer: { label: '夏季（6-8月）', months: [6, 7, 8] },
  autumn: { label: '秋季（9-11月）', months: [9, 10, 11] },
  winter: { label: '冬季（12-2月）', months: [12, 1, 2] }
};

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

const commonEssentials = [
  { item: '身份证/护照', icon: '🪪', category: '证件' },
  { item: '手机及充电器', icon: '📱', category: '电子' },
  { item: '充电宝', icon: '🔋', category: '电子' },
  { item: '少量现金/银行卡', icon: '💳', category: '证件' },
  { item: '个人常用药品', icon: '💊', category: '健康' }
];

const categoryEssentials = {
  海滨度假: [
    { item: '防晒霜（SPF50+）', icon: '🧴', category: '防护' },
    { item: '泳衣/沙滩裤', icon: '🩱', category: '衣物' },
    { item: '墨镜', icon: '🕶️', category: '防护' },
    { item: '拖鞋/沙滩鞋', icon: '🩴', category: '鞋履' },
    { item: '防水手机袋', icon: '📱', category: '电子' },
    { item: '速干毛巾', icon: '🧻', category: '日用' },
    { item: '遮阳帽', icon: '🧢', category: '防护' }
  ],
  古镇之旅: [
    { item: '舒适步行鞋', icon: '👟', category: '鞋履' },
    { item: '相机', icon: '📷', category: '电子' },
    { item: '折叠伞', icon: '☂️', category: '日用' },
    { item: '轻薄外套', icon: '🧥', category: '衣物' },
    { item: '便携水杯', icon: '🥤', category: '日用' }
  ],
  名胜古迹: [
    { item: '舒适步行鞋', icon: '👟', category: '鞋履' },
    { item: '相机/手机云台', icon: '📷', category: '电子' },
    { item: '折叠伞/遮阳帽', icon: '☂️', category: '防护' },
    { item: '讲解器或导览App', icon: '🎧', category: '电子' },
    { item: '轻便背包', icon: '🎒', category: '日用' }
  ],
  森林公园: [
    { item: '登山鞋/徒步鞋', icon: '🥾', category: '鞋履' },
    { item: '冲锋衣/防风外套', icon: '🧥', category: '衣物' },
    { item: '驱蚊液', icon: '🦟', category: '防护' },
    { item: '登山杖', icon: '🦯', category: '装备' },
    { item: '能量棒/干粮', icon: '🍫', category: '食物' },
    { item: '大容量水壶', icon: '🥤', category: '日用' },
    { item: '急救包', icon: '🏥', category: '健康' }
  ],
  沙漠探险: [
    { item: '防晒面罩/魔术头巾', icon: '🧣', category: '防护' },
    { item: '高倍防晒霜', icon: '🧴', category: '防护' },
    { item: '防风沙眼镜', icon: '🥽', category: '防护' },
    { item: '大容量水壶', icon: '🥤', category: '日用' },
    { item: '冲锋衣（早晚温差大）', icon: '🧥', category: '衣物' },
    { item: '手机防沙袋', icon: '📱', category: '电子' }
  ],
  壮丽瀑布: [
    { item: '防水外套/雨衣', icon: '🧥', category: '衣物' },
    { item: '防滑鞋', icon: '🥾', category: '鞋履' },
    { item: '防水手机袋', icon: '📱', category: '电子' },
    { item: '速干衣裤', icon: '👕', category: '衣物' },
    { item: '相机防雨罩', icon: '📷', category: '电子' }
  ],
  魅力城市: [
    { item: '舒适步行鞋', icon: '👟', category: '鞋履' },
    { item: '折叠伞', icon: '☂️', category: '日用' },
    { item: '便携充电宝', icon: '🔋', category: '电子' },
    { item: '轻便背包/斜挎包', icon: '🎒', category: '日用' },
    { item: '城市地图App离线包', icon: '🗺️', category: '电子' }
  ],
  野外露营: [
    { item: '帐篷/睡袋/防潮垫', icon: '⛺', category: '装备' },
    { item: '头灯/手电筒', icon: '🔦', category: '装备' },
    { item: '驱蚊液', icon: '🦟', category: '防护' },
    { item: '冲锋衣', icon: '🧥', category: '衣物' },
    { item: '便携炉具/餐具', icon: '🍽️', category: '装备' },
    { item: '急救包', icon: '🏥', category: '健康' },
    { item: '垃圾袋（无痕露营）', icon: '🗑️', category: '日用' }
  ],
  自然风光: [
    { item: '登山鞋/徒步鞋', icon: '🥾', category: '鞋履' },
    { item: '冲锋衣（应对多变天气）', icon: '🧥', category: '衣物' },
    { item: '相机/广角镜头', icon: '📷', category: '电子' },
    { item: '水壶', icon: '🥤', category: '日用' },
    { item: '防晒用品', icon: '🧴', category: '防护' },
    { item: '驱蚊液', icon: '🦟', category: '防护' }
  ]
};

const seasonEssentials = {
  spring: [
    { item: '轻薄外套（早晚微凉）', icon: '🧥', category: '衣物' },
    { item: '抗过敏药（花粉季）', icon: '💊', category: '健康' },
    { item: '折叠伞（春雨绵绵）', icon: '☂️', category: '日用' }
  ],
  summer: [
    { item: '防晒霜', icon: '🧴', category: '防护' },
    { item: '遮阳帽/遮阳伞', icon: '🧢', category: '防护' },
    { item: '便携小风扇', icon: '💨', category: '日用' },
    { item: '防暑药品', icon: '💊', category: '健康' },
    { item: '速干T恤', icon: '👕', category: '衣物' }
  ],
  autumn: [
    { item: '薄毛衣/卫衣', icon: '👕', category: '衣物' },
    { item: '围巾', icon: '🧣', category: '衣物' },
    { item: '保湿护肤品', icon: '🧴', category: '日用' },
    { item: '保温杯', icon: '🥤', category: '日用' }
  ],
  winter: [
    { item: '羽绒服/厚外套', icon: '🧥', category: '衣物' },
    { item: '保暖内衣', icon: '👕', category: '衣物' },
    { item: '手套/围巾/帽子', icon: '🧣', category: '衣物' },
    { item: '暖宝宝', icon: '🔥', category: '日用' },
    { item: '润唇膏/护手霜', icon: '🧴', category: '日用' },
    { item: '防滑鞋（冰雪路面）', icon: '🥾', category: '鞋履' }
  ]
};

const interestEssentials = {
  photo: [
    { item: '相机/备用电池', icon: '📷', category: '电子' },
    { item: '三脚架/自拍杆', icon: '📸', category: '装备' },
    { item: '备用存储卡', icon: '💾', category: '电子' }
  ],
  hike: [
    { item: '登山杖', icon: '🦯', category: '装备' },
    { item: '护膝', icon: '🦵', category: '装备' },
    { item: '能量补给', icon: '🍫', category: '食物' }
  ],
  family: [
    { item: '儿童常用药', icon: '💊', category: '健康' },
    { item: '零食/小玩具', icon: '🍬', category: '食物' },
    { item: '湿巾/纸巾', icon: '🧻', category: '日用' }
  ],
  food: [
    { item: '健胃消食片', icon: '💊', category: '健康' },
    { item: '便携餐具', icon: '🥢', category: '日用' }
  ],
  night: [
    { item: '小型手电/补光灯', icon: '🔦', category: '装备' },
    { item: '轻便三脚架', icon: '📸', category: '装备' }
  ]
};

// ==================== 帮助函数 ====================

function getDestinationById(id) {
  return destinations.find((item) => item.id === String(id));
}

function normalizeQuery(text) {
  return (text || '').trim();
}

function pickCyclic(list, index) {
  if (!Array.isArray(list) || !list.length) return '';
  return list[index % list.length];
}

function toRangeText(min, max) {
  return `${Math.round(min)}-${Math.round(max)} 元`;
}

function scaleRange(range, multiplier) {
  return [range[0] * multiplier, range[1] * multiplier];
}

function sumRanges(ranges) {
  return ranges.reduce((acc, item) => [acc[0] + item[0], acc[1] + item[1]], [0, 0]);
}

function getScenePreset(destination) {
  return categoryScenes[destination.category] || categoryScenes['自然风光'];
}

// ==================== 意图分类 ====================

/**
 * 将用户输入分类为具体意图类型
 * @returns {'greeting'|'plan_request'|'budget_inquiry'|'transport_inquiry'|'destination_inquiry'|'packing_inquiry'|'weather_inquiry'|'general_question'}
 */
function classifyQuestion(message) {
  const q = normalizeQuery(message);
  if (!q) return 'greeting';

  // 打招呼
  if (/^(你好|您好|hi|hello|嗨|在吗|在不在|你是谁|你会什么|你能做什么|怎么用|介绍一下|有什么功能|嗨喽|早|早上好|中午好|晚上好)[\s!！。.,，]*$/i.test(q)) {
    return 'greeting';
  }

  // 询问需要带什么
  if (/(带什么|要带什么|必备|必需品|准备什么|装备|行李|打包|收拾|出行清单|必带|需要准备|该带|带哪些)/.test(q)) {
    return 'packing_inquiry';
  }

  // 询问预算
  if (/(预算|多少钱|花费|费用|开销|人均|成本|贵不贵|便宜|省钱|划算|大概要花|消费)/.test(q)) {
    return 'budget_inquiry';
  }

  // 询问交通
  if (/(怎么去|怎么过去|交通|高铁|火车|机票|航班|自驾|飞过去|落地|坐什么|怎么坐车|从.*出发|怎么到达)/.test(q)) {
    return 'transport_inquiry';
  }

  // 询问天气
  if (/(天气|气温|冷不冷|热不热|穿什么|下雨|下雪|气候|季节|几月.*好|什么时候.*去)/.test(q)) {
    return 'weather_inquiry';
  }

  // 询问目的地推荐
  if (/(推荐|哪里好玩|有什么.*地方|去哪|去哪儿|哪个.*好|求推荐|适合.*去|值得.*去|好玩.*地方|介绍.*下|有哪些)/.test(q) && !/(规划|行程|路线|攻略|安排)/.test(q)) {
    return 'destination_inquiry';
  }

  // 请求规划行程
  if (/(规划|行程|路线|攻略|安排|计划|怎么玩|帮我做|帮我排|帮我安排|生成.*行程|自由行|定制|出游|旅行|旅游|去哪.*玩|玩几天|周末.*去|假期.*去|出发|想去|打算去|准备去)/.test(q) ||
      (/(\d+)\s*天/.test(q) && hasDestinationHint(q))) {
    return 'plan_request';
  }

  return 'general_question';
}

/**
 * 检查是否提到了目的地
 */
function hasDestinationHint(query) {
  return destinationHints.some((hint) =>
    hint.keywords.some((keyword) => query.indexOf(keyword) !== -1)
  ) || themeFallbacks.some((hint) =>
    hint.keywords.some((keyword) => query.indexOf(keyword) !== -1)
  );
}

// ==================== 参数提取 ====================

function extractDays(query) {
  const matched = query.match(/(\d+)\s*天/);
  if (matched) return Math.max(1, Math.min(Number(matched[1]), 7));
  const chineseMatched = query.match(/([一二两三四五六七])\s*天/);
  if (!chineseMatched) return null;
  const mapping = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7 };
  return mapping[chineseMatched[1]] || null;
}

function extractBudget(query) {
  if (/(低预算|省钱|学生|穷游|预算少|经济型|穷|便宜).*/.test(query)) return 'low';
  if (/(奢华|高预算|住好一点|预算充足|品质游|不差钱|高端|奢侈).*/.test(query)) return 'high';
  return null;
}

function extractOrigin(query) {
  const matched = query.match(/从([A-Za-z一-龥]{2,12})(?:出发|过去|飞|坐高铁|坐火车|去)/);
  if (matched && matched[1]) return matched[1].replace(/[，。！？,.!?、\s]+/g, '');
  const fallback = query.match(/([A-Za-z一-龥]{2,12})出发/);
  if (fallback && fallback[1]) return fallback[1].replace(/[，。！？,.!?、\s]+/g, '');
  return null;
}

function extractPace(query) {
  if (/(特种兵|赶景点|暴走|高强度|打卡式)/.test(query)) return 'fast';
  if (/(慢游|轻松|休闲|不赶|慢一点|深度游)/.test(query)) return 'slow';
  return null;
}

function extractInterests(query) {
  const interests = [];
  if (/(拍照|摄影|出片|机位)/.test(query)) interests.push('photo');
  if (/(美食|吃|夜市|小吃|餐厅|吃货)/.test(query)) interests.push('food');
  if (/(文化|博物馆|古迹|展馆|历史)/.test(query)) interests.push('culture');
  if (/(放松|度假|酒店|咖啡|躺平)/.test(query)) interests.push('relax');
  if (/(徒步|登山|爬山|步道|露营)/.test(query)) interests.push('hike');
  if (/(亲子|孩子|小朋友|带娃)/.test(query)) interests.push('family');
  if (/(夜景|夜游|夜拍|夜生活)/.test(query)) interests.push('night');
  return interests.length ? interests : null;
}

function pickDestination(query) {
  for (let i = 0; i < destinationHints.length; i += 1) {
    const hint = destinationHints[i];
    if (hint.keywords.some((keyword) => query.indexOf(keyword) !== -1)) {
      return Object.assign({}, getDestinationById(hint.id), { source: 'known' });
    }
  }
  const customDestination = extractCustomDestination(query);
  if (customDestination) {
    return buildCustomDestination(customDestination, query);
  }
  for (let i = 0; i < themeFallbacks.length; i += 1) {
    const hint = themeFallbacks[i];
    if (hint.keywords.some((keyword) => query.indexOf(keyword) !== -1)) {
      return Object.assign({}, getDestinationById(hint.id), { source: 'theme' });
    }
  }
  return null;
}

function extractCustomDestination(query) {
  const directPatterns = [
    /(?:去|到|在|想去|想玩|打算去|准备去|帮我规划|帮我做|规划|安排|推荐)\s*([A-Za-z一-龥]{2,12})/,
    /^([A-Za-z一-龥]{2,12})(?:\d+\s*天|旅行|旅游|攻略|行程|怎么玩|拍照|摄影|美食|夜景|夜游|露营|亲子|慢游|轻松|休闲|度假|自由行)/
  ];

  for (let i = 0; i < directPatterns.length; i += 1) {
    const matched = query.match(directPatterns[i]);
    if (matched) {
      const token = normalizeDestinationToken(matched[1]);
      if (isMeaningfulDestinationToken(token)) return token;
    }
  }

  const cleaned = query
    .replace(/\d+\s*天/g, ' ')
    .replace(/[，。！？,.!?、/]/g, ' ')
    .replace(/(帮我|请帮我|想去|打算去|准备去|我想去|给我|推荐|安排|规划|生成|做个|做一份|旅行|旅游|行程|攻略|路线|怎么玩|自由行|周末|假期|预算|低预算|高预算|拍照|摄影|出片|美食|夜景|夜游|夜拍|文化|历史|放松|度假|酒店|咖啡|徒步|登山|步道|露营|亲子|带娃|情侣|小众|慢游|轻松|休闲|特种兵|暴走|高强度|打卡|看海|看日出|看日落)/g, ' ');

  const tokens = cleaned.match(/[A-Za-z一-龥]{2,12}/g) || [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = normalizeDestinationToken(tokens[i]);
    if (isMeaningfulDestinationToken(token)) return token;
  }
  return null;
}

function normalizeDestinationToken(token) {
  if (!token) return '';
  return token
    .replace(/(\d+|[一二两三四五六七])\s*天/g, '')
    .replace(/^[去到在想玩想去打算准备帮我请给做份做个]+/, '')
    .replace(/[，。！？,.!?、\s]+/g, '')
    .replace(/(旅游|旅行|行程|攻略|路线|玩法|计划|规划|自由行|假期|周末|拍照|摄影|美食|夜景|徒步|露营|亲子|慢游|轻松|休闲|预算).*$/, '');
}

function isMeaningfulDestinationToken(token) {
  if (!token || token.length < 2 || token.length > 12) return false;
  return !ignoredDestinationTokens.some((word) => token === word || token.indexOf(word) !== -1);
}

function buildCustomDestination(name, query) {
  return {
    id: `custom-${name}`,
    name,
    region: `${name} · 定制路线`,
    description: `根据你的输入为 ${name} 生成一套更贴近偏好的旅行安排。`,
    image: '',
    category: inferCategory(query),
    source: 'custom'
  };
}

function inferCategory(query) {
  if (/(海南|三亚|厦门|鼓浪屿|海边|海岛|看海|沙滩|海湾|滨海)/.test(query)) return '海滨度假';
  if (/(云南|大理|丽江|古镇|古城|水乡|老街|苏州|平遥|乌镇)/.test(query)) return '古镇之旅';
  if (/(呼伦贝尔|草原|露营|营地)/.test(query)) return '野外露营';
  if (/(历史|博物馆|古迹|皇城|展馆|文化)/.test(query)) return '名胜古迹';
  if (/(森林|雨林|植物园)/.test(query)) return '森林公园';
  if (/(瀑布)/.test(query)) return '壮丽瀑布';
  if (/(沙漠|戈壁)/.test(query)) return '沙漠探险';
  if (/(登山|爬山|徒步|雪山|湖泊|自然|风光)/.test(query)) return '自然风光';
  return '魅力城市';
}

function hasDestinationMention(query) {
  return destinationHints.some((hint) => hint.keywords.some((keyword) => query.indexOf(keyword) !== -1));
}

// ==================== 提取完整行程参数 ====================

/**
 * 从用户输入中提取所有可用的行程参数
 */
function extractTripParams(message) {
  const q = normalizeQuery(message);
  return {
    destination: pickDestination(q),
    days: extractDays(q),
    budget: extractBudget(q),
    pace: extractPace(q),
    interests: extractInterests(q),
    origin: extractOrigin(q)
  };
}

/**
 * 合并已有上下文和新提取的参数（新值覆盖旧值）
 */
function mergeTripContext(existing, newParams) {
  const merged = Object.assign({}, existing);
  if (newParams.destination) merged.destination = newParams.destination;
  if (newParams.days) merged.days = newParams.days;
  if (newParams.budget) merged.budget = newParams.budget;
  if (newParams.pace) merged.pace = newParams.pace;
  if (newParams.interests) merged.interests = newParams.interests;
  if (newParams.origin) merged.origin = newParams.origin;
  return merged;
}

/**
 * 检查行程参数是否足够生成计划（至少需要目的地 + 天数或两个其他参数）
 */
function isTripInfoComplete(ctx) {
  if (!ctx.destination) return false;
  let count = 0;
  if (ctx.days) count += 1;
  if (ctx.budget) count += 1;
  if (ctx.interests && ctx.interests.length) count += 1;
  return count >= 1;
}

/**
 * 收集缺失的参数列表
 */
function getMissingParams(ctx) {
  const missing = [];
  if (!ctx.destination) missing.push('目的地');
  if (!ctx.days) missing.push('游玩天数');
  if (!ctx.budget) missing.push('预算范围');
  if (!ctx.interests || !ctx.interests.length) missing.push('旅行偏好');
  return missing;
}

// ==================== 上下文参数口语化文本 ====================

function describeContext(ctx) {
  const parts = [];
  if (ctx.destination) parts.push(`目的地：${ctx.destination.name}`);
  if (ctx.days) parts.push(`${ctx.days}天`);
  if (ctx.budget) parts.push(budgetLabels[ctx.budget]);
  if (ctx.interests && ctx.interests.length) {
    parts.push((ctx.interests || []).map((k) => interestLabels[k]).filter(Boolean).join('、'));
  }
  if (ctx.pace) parts.push(paceLabels[ctx.pace]);
  return parts.join(' · ');
}

// ==================== 智能回复生成 ====================

/**
 * 根据意图类型生成欢迎/引导回复
 */
function buildGreetingReply() {
  return '嗨！我是你的 AI 旅行规划师 🌿\n\n你可以直接告诉我目的地、玩几天、预算和偏好，我会帮你生成专属行程。\n\n比如试试说：\n• "三亚 3 天拍照美食慢游"\n• "想去云南，预算 3000，5 天怎么玩"\n• "周末苏州 2 天深度游"';
}

/**
 * 生成预算咨询回复
 */
function buildBudgetReply(query, ctx) {
  if (ctx.destination) {
    return buildBudgetAdvice(buildFullProfile(query, ctx));
  }
  return '旅行预算主要包括几个部分：\n\n• **大交通**：往返机票/高铁，通常占 30-40%\n• **住宿**：每晚 150-1500 元不等\n• **吃喝**：人均每天 100-500 元\n• **门票+交通**：根据目的地差异较大\n\n告诉我你想去的目的地和天数，我可以帮你做个更精确的预算估算。';
}

/**
 * 生成交通咨询回复
 */
function buildTransportReply(query, ctx) {
  if (ctx.destination && ctx.origin) {
    return buildTransportAdvice(buildFullProfile(query, ctx));
  }
  if (ctx.destination) {
    return `去${ctx.destination.name}的话，交通方式取决于你从哪里出发。方便告诉我出发城市吗？这样我可以帮你对比高铁和飞机的性价比。`;
  }
  return '交通方式选择主要看三点：\n\n• **距离**：短途优选高铁，长途选飞机\n• **预算**：高铁价格稳定，机票淡旺季波动大\n• **体验**：自驾灵活但累，公共交通省心\n\n告诉我出发地和目的地，我帮你具体分析。';
}

/**
 * 生成目的地推荐回复
 */
function buildDestinationInquiryReply(query) {
  const interests = extractInterests(query);
  const budget = extractBudget(query);

  let reply = '根据你的偏好，推荐几个热门目的地：\n\n';

  if (interests && interests.indexOf('photo') !== -1) {
    reply += '📷 **拍照出片**：云南大理/丽江、青海湖、稻城亚丁、厦门鼓浪屿\n';
  }
  if (interests && interests.indexOf('food') !== -1) {
    reply += '🍜 **美食之旅**：成都、厦门、广州、西安\n';
  }
  if (interests && interests.indexOf('culture') !== -1) {
    reply += '🏛️ **文化深度**：北京、苏州、敦煌、平遥古城\n';
  }
  if (interests && interests.indexOf('relax') !== -1) {
    reply += '🌴 **放松度假**：三亚、大理、乌镇、阳朔\n';
  }
  if (interests && interests.indexOf('hike') !== -1) {
    reply += '🥾 **徒步户外**：黄山、张家界、呼伦贝尔、四姑娘山\n';
  }

  if (!interests || !interests.length) {
    reply += '🌊 **海滨度假**：三亚、厦门、青岛\n';
    reply += '🏔️ **自然风光**：九寨沟、张家界、黄山\n';
    reply += '🏛️ **人文古迹**：北京、西安、苏州\n';
    reply += '🍜 **美食城市**：成都、广州、重庆\n';
  }

  reply += '\n告诉我你想去哪里、玩几天，我帮你出具体行程！';
  return reply;
}

/**
 * 生成天气/季节咨询回复
 */
function buildWeatherReply(query, ctx) {
  const season = getCurrentSeason();
  const seasonLabel = seasonMap[season].label;

  let reply = `现在是${seasonLabel}，出行建议：\n\n`;

  if (ctx && ctx.destination) {
    const dest = ctx.destination;
    if (/(三亚|厦门|海南|鼓浪屿|海边|海岛)/.test(dest.name + dest.region)) {
      reply += `🏖️ **${dest.name}** 当前季节适合海边活动，注意防晒和补水。\n`;
    } else if (/(北京|故宫|西安|敦煌)/.test(dest.name + dest.region)) {
      reply += `🏛️ **${dest.name}** 历史文化类目的地受季节影响较小，但要注意早晚温差。\n`;
    } else if (/(云南|大理|丽江)/.test(dest.name + dest.region)) {
      reply += `🏔️ **${dest.name}** 高原地区紫外线较强，早晚温差大，建议带薄外套。\n`;
    } else {
      reply += `关于**${dest.name}**，建议出发前查看当地一周天气预报。\n`;
    }
  }

  if (season === 'spring') {
    reply += '🌸 春季适合赏花踏青，江南古镇和自然景区都是好选择。';
  } else if (season === 'summer') {
    reply += '☀️ 夏季推荐高原避暑（云南、青海）或海边度假（三亚、厦门）。';
  } else if (season === 'autumn') {
    reply += '🍂 秋季是旅行的黄金季节，大部分目的地都很适合，特别是自然风光类。';
  } else {
    reply += '❄️ 冬季推荐南下避寒（三亚、西双版纳）或北上赏雪（哈尔滨、长白山）。';
  }

  return reply;
}

/**
 * 生成计划请求回复——多轮对话式收集信息
 */
function buildPlanRequestReply(query, ctx) {
  const newParams = extractTripParams(query);
  const merged = mergeTripContext(ctx, newParams);

  // 信息足够，准备生成多方案
  if (isTripInfoComplete(merged)) {
    return {
      reply: buildPlanReadyReply(merged),
      context: merged,
      readyToGenerate: true
    };
  }

  // 信息不足，引导补充
  const missing = getMissingParams(merged);
  return {
    reply: buildInfoCollectionReply(merged, missing),
    context: merged,
    readyToGenerate: false
  };
}

/**
 * 信息足够时的确认回复
 */
function buildPlanReadyReply(ctx) {
  const profile = buildFullProfileFromContext(ctx);
  const interestSummary = getInterestSummary(profile.interests);
  const lines = [];

  lines.push(`好的！我已经了解了你的需求：`);
  lines.push('');
  lines.push(`📍 **目的地**：${ctx.destination.name}`);
  lines.push(`📅 **天数**：${ctx.days || 3} 天`);
  lines.push(`💰 **预算**：${budgetLabels[ctx.budget || 'medium']}`);
  lines.push(`🎯 **偏好**：${interestSummary}`);
  if (ctx.pace) lines.push(`🏃 **节奏**：${paceLabels[ctx.pace]}`);
  if (ctx.origin) lines.push(`🚄 **出发地**：${ctx.origin}`);
  lines.push('');
  lines.push('我为你准备了 **3 套不同风格** 的方案，可以切换查看，选一套直接导入即可 👇');

  return lines.join('\n');
}

/**
 * 信息不足时的引导回复
 */
function buildInfoCollectionReply(ctx, missing) {
  const lines = [];

  if (ctx.destination) {
    lines.push(`好的，你想去**${ctx.destination.name}**！为了让行程更贴合你的需求，还需要确认几件事：`);
  } else {
    lines.push('好的，我来帮你规划行程！先确认几个关键信息：');
  }

  lines.push('');

  const questionTemplates = {
    '目的地': '你想去哪里呢？直接告诉我城市或景点名字就行',
    '游玩天数': '计划玩几天？2-3天短途还是5-7天深度游？',
    '预算范围': '预算大概是什么水平？\n  • 💚 经济实惠（省钱为主）\n  • 💛 舒适均衡（体验优先）\n  • 💜 品质享受（吃住讲究）',
    '旅行偏好': '更看重哪些体验？\n  • 📷 拍照出片\n  • 🍜 美食探店\n  • 🏛️ 文化历史\n  • 🌿 放松度假\n  • 🥾 徒步户外\n  • 👨‍👩‍👧 亲子出游\n  • 🌃 夜景夜游'
  };

  // 优先问最关键的缺失信息
  const priority = ['目的地', '游玩天数', '预算范围', '旅行偏好'];
  const asked = [];
  for (let i = 0; i < priority.length; i += 1) {
    if (missing.indexOf(priority[i]) !== -1 && asked.length < 2) {
      asked.push(priority[i]);
    }
  }

  for (let i = 0; i < asked.length; i += 1) {
    lines.push(`**${i + 1}. ${asked[i]}** — ${questionTemplates[asked[i]]}`);
    if (i < asked.length - 1) lines.push('');
  }

  if (ctx.destination && ctx.days && missing.length <= 1) {
    lines.push('');
    lines.push('或者直接说"就这样出方案"，我马上按当前信息帮你生成。');
  }

  return lines.join('\n');
}

// ==================== 多方案生成 ====================

/**
 * 生成 2-3 套不同风格的行程方案
 */
function generateMultiOptions(prompt, ctx) {
  const profile = buildFullProfileFromContext(ctx || {});
  if (!profile.destination) return [];

  const variants = buildPlanVariants(profile);
  return variants.map((variant) => ({
    variantKey: variant.key,
    variantLabel: variant.label,
    variantDesc: variant.desc,
    variantIcon: variant.icon,
    profile: Object.assign({}, profile, {
      pace: variant.pace || profile.pace,
      budget: variant.budget || profile.budget,
      interests: variant.interests || profile.interests
    }),
    days: generatePlanDays(profile.destination, Object.assign({}, profile, {
      pace: variant.pace || profile.pace,
      budget: variant.budget || profile.budget,
      interests: variant.interests || profile.interests
    }))
  }));
}

/**
 * 定义方案变体
 */
function buildPlanVariants(profile) {
  const dest = profile.destination;
  const isNature = /(自然|山|湖|海|森林|瀑布|草原|沙漠|雪山)/.test(dest.category || '');
  const isCity = /(城市|古镇|古迹)/.test(dest.category || '');

  const variants = [
    {
      key: 'classic',
      label: '经典全景',
      icon: '🌟',
      desc: '覆盖必打卡景点，适合首次到访，路线成熟稳妥',
      pace: 'balanced',
      budget: 'medium',
      interests: profile.interests
    }
  ];

  if (isNature) {
    variants.push({
      key: 'deep',
      label: '深度探索',
      icon: '🔍',
      desc: '避开人潮，走小众路线和隐藏机位，体验更纯粹的自然',
      pace: 'slow',
      budget: profile.budget || 'medium',
      interests: (profile.interests || ['photo', 'hike']).filter((k) => k !== 'family')
    });
  } else if (isCity) {
    variants.push({
      key: 'culture',
      label: '文化慢品',
      icon: '📖',
      desc: '放慢节奏，深入街巷和人文空间，像当地人一样生活',
      pace: 'slow',
      budget: profile.budget || 'medium',
      interests: ['culture', 'food', 'relax']
    });
  } else {
    variants.push({
      key: 'deep',
      label: '深度慢游',
      icon: '🌿',
      desc: '放慢节奏，每处都细细品味，不赶路不打卡',
      pace: 'slow',
      budget: profile.budget || 'medium',
      interests: (profile.interests || ['relax', 'food'])
    });
  }

  variants.push({
    key: 'budget',
    label: '性价比之选',
    icon: '💡',
    desc: '精打细算，本地人私藏路线，花更少玩更好',
    pace: 'balanced',
    budget: 'low',
    interests: (profile.interests || ['food', 'photo']).filter((k) => k !== 'family')
  });

  return variants;
}

/**
 * 为某个方案生成每天的计划
 */
function generatePlanDays(destination, profile) {
  const plans = [];
  const days = profile.days || 3;
  for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
    plans.push(buildActivitiesForDay(destination, profile, dayIndex));
  }
  return plans;
}

// ==================== 行程构建（保持原有逻辑）====================

function getDestinationGuide(destination, query) {
  const matchedText = `${destination.name || ''} ${destination.region || ''} ${query || ''}`;
  const guide = destinationGuideBank.find((item) => item.aliases.some((alias) => matchedText.indexOf(alias) !== -1));
  return guide ? clone(guide) : buildFallbackGuide(destination);
}

function buildFallbackGuide(destination) {
  const preset = getScenePreset(destination);
  return {
    region: destination.region || `${destination.name} · 定制路线`,
    morningSpots: [`${destination.name}${preset.spots[0]}`, `${destination.name}${preset.spots[1]}`, preset.spots[0], preset.spots[2]],
    photoSpots: [`${preset.spots[0]}附近高点`, `${preset.spots[1]}转角`, `${preset.spots[2]}光线位`],
    foodSpots: [preset.food, `${destination.name}老街口碑店`, `${destination.name}夜市或在地馆子`],
    cultureSpots: [`${destination.name}在地街区`, `${destination.name}手作或展陈空间`, `${destination.name}老街`],
    relaxSpots: [`${destination.name}景观咖啡馆`, `${destination.name}临水步道`, `${destination.name}安静休息点`],
    hikeSpots: [`${preset.spots[1]}周边步道`, `${preset.spots[0]}观景路径`, `${preset.spots[2]}制高点`],
    familySpots: [`${destination.name}亲子友好步行段`, `${destination.name}轻松互动点`, `${destination.name}补给点`],
    nightSpots: [preset.night, `${preset.spots[2]}附近夜色`, `${destination.name}夜游路段`]
  };
}

function getPrimaryFocus(profile, dayIndex) {
  const interests = profile.interests && profile.interests.length ? profile.interests : ['photo', 'food'];
  return interests[dayIndex % interests.length];
}

function getSecondaryFocus(profile, dayIndex) {
  const interests = profile.interests && profile.interests.length ? profile.interests : ['photo', 'food'];
  if (interests.length === 1) return interests[0] === 'food' ? 'photo' : 'relax';
  return interests[(dayIndex + 1) % interests.length];
}

function getFocusTitle(primaryFocus, dayIndex) {
  return pickCyclic(focusTitleBank[primaryFocus] || focusTitleBank.photo, dayIndex);
}

function getFocusSpot(guide, focus, dayIndex) {
  if (focus === 'food') return pickCyclic(guide.foodSpots, dayIndex);
  if (focus === 'culture') return pickCyclic(guide.cultureSpots, dayIndex);
  if (focus === 'relax') return pickCyclic(guide.relaxSpots, dayIndex);
  if (focus === 'hike') return pickCyclic(guide.hikeSpots, dayIndex);
  if (focus === 'family') return pickCyclic(guide.familySpots, dayIndex);
  if (focus === 'night') return pickCyclic(guide.nightSpots, dayIndex);
  return pickCyclic(guide.photoSpots, dayIndex);
}

function buildMorningActivity(destination, profile, guide, primaryFocus, dayIndex, time) {
  const spot = pickCyclic(guide.morningSpots, dayIndex);
  const arrivalPrefix = dayIndex === 0 && profile.origin
    ? `${time} 从${profile.origin}出发更建议${inferTransportMode(profile) === 'flight' ? '早点飞抵后' : inferTransportMode(profile) === 'rail' ? '坐早班高铁到达后' : '直接短途过去后'}，`
    : `${time} `;
  if (primaryFocus === 'food') return `${arrivalPrefix}从${spot}附近的早市或街区慢慢逛起，先把在地早餐和城市烟火气吃到位，${composePaceText(profile.pace)}`;
  if (primaryFocus === 'culture') return `${arrivalPrefix}从${spot}开始慢慢走，先把${destination.name}的人文气质和在地节奏看进去，${composePaceText(profile.pace)}`;
  if (primaryFocus === 'relax') return `${arrivalPrefix}先在${spot}附近放慢节奏，不急着赶景点，把这趟${destination.name}行程的松弛感先找回来`;
  if (primaryFocus === 'hike') return `${arrivalPrefix}把体力最好的时段留给${spot}这段路线，先把视野拉开，今天的重点是走得舒服也看得值`;
  if (primaryFocus === 'family') return `${arrivalPrefix}从${spot}这种步行压力较小的片区开始，边走边休息，整体节奏对同行家人会更友好`;
  if (primaryFocus === 'night') return `${arrivalPrefix}白天先去${spot}踩点，顺手记下晚上最好看的灯光和日落角度，为夜景主场做准备`;
  return `${arrivalPrefix}先到${spot}等一段干净光线，把${destination.name}最有辨识度的开场画面拍下来，${composePaceText(profile.pace)}`;
}

function buildLateMorningActivity(destination, guide, focus, dayIndex, time) {
  const focusSpot = getFocusSpot(guide, focus, dayIndex + 1);
  if (focus === 'food') return `${time} 转去${focusSpot}附近继续扫街，把这座地方最值得试的一两样招牌小吃补上`;
  if (focus === 'culture') return `${time} 在${focusSpot}留一段完整停留时间，别只拍照打卡，把建筑、展线或老街细节认真看一遍`;
  if (focus === 'relax') return `${time} 在${focusSpot}安排一段慢坐或散步，顺手把午后节奏压下来，不让行程显得过满`;
  if (focus === 'hike') return `${time} 继续走到${focusSpot}这一段，控制在轻徒步强度内，把最好看的视角放在体力还充足的时候`;
  if (focus === 'family') return `${time} 把下一段放在${focusSpot}，以互动体验和轻松停留为主，方便拍照也方便补给`;
  if (focus === 'night') return `${time} 去${focusSpot}确认夜里最出片的位置，白天顺手拍环境，晚上回来直接进入状态`;
  return `${time} 去${focusSpot}补一组更有层次的照片，重点拍细节、人像和更干净的构图角度`;
}

function buildLunchActivity(profile, guide, dayIndex, time) {
  const foodSpot = pickCyclic(guide.foodSpots, dayIndex);
  return `${time} 午餐放在${foodSpot}，${composeBudgetText(profile.budget)}，这样吃得舒服也不会把整天预算拉得太紧`;
}

function buildAfternoonActivity(destination, guide, focus, dayIndex, time) {
  const focusSpot = getFocusSpot(guide, focus, dayIndex + 2);
  if (focus === 'food') return `${time} 下午把路线接到${focusSpot}周边，主打边逛边吃，挑一两家本地人会回头去的店，不追空有名气的网红点`;
  if (focus === 'culture') return `${time} 下午留给${focusSpot}这一段，更适合慢看建筑、街巷和当地生活方式，行程会更有内容`;
  if (focus === 'relax') return `${time} 下午在${focusSpot}放慢一点，喝杯东西、看看风景，把体力留给傍晚最舒服的时段`;
  if (focus === 'hike') return `${time} 下午安排${focusSpot}这类强度可控的步行段，既能活动开，也不至于把晚上的节奏拖垮`;
  if (focus === 'family') return `${time} 下午选择${focusSpot}这种宽松路线，给同行的人留出自由活动和休息时间，体验会更稳`;
  if (focus === 'night') return `${time} 白天最后这段在${focusSpot}附近慢慢走，把夜景前需要踩好的机位和动线提前理顺`;
  return `${time} 下午转到${focusSpot}，重点补拍更生活化、故事感更强的画面，让照片不只停留在景点打卡`;
}

function buildEveningActivity(destination, guide, profile, dayIndex, time) {
  const nightSpot = pickCyclic(guide.nightSpots, dayIndex);
  const text = profile.interests.indexOf('night') !== -1
    ? `傍晚直接把重头戏放在${nightSpot}，等灯光和天空颜色到位再出片，夜景体验要放到最后才完整`
    : `傍晚去${nightSpot}收尾，边散步边看风景，让${destination.name}最有氛围的时段自然落在今天最后`;
  return `${time} ${text}`;
}

function composeBudgetText(budget) {
  if (budget === 'low') return '优先选择公共交通和口碑稳定的平价店，预算会更可控';
  if (budget === 'high') return '可以把体验重点放在景观住宿、舒适交通和更稳妥的餐厅选择上';
  return '住宿和交通保持均衡投入，整体体验会更稳';
}

function composePaceText(pace) {
  if (pace === 'fast') return '今天节奏会稍紧凑，核心景点优先，尽量少走回头路';
  if (pace === 'slow') return '今天节奏刻意放慢，重点是体验感，不需要打卡过多点位';
  return '今天保持轻松但不松散的节奏，兼顾经典景点和在地体验';
}

function buildActivitiesForDay(destination, profile, dayIndex) {
  const dayNo = dayIndex + 1;
  const guide = getDestinationGuide(destination, profile.raw);
  const primaryFocus = getPrimaryFocus(profile, dayIndex);
  const secondaryFocus = getSecondaryFocus(profile, dayIndex);
  const timeSlots = getTimeSlots(profile, dayIndex);
  const stage = pickCyclic(stageLabels, dayIndex);
  const focusTitle = getFocusTitle(primaryFocus, dayIndex);
  const coreLocation = pickCyclic(guide.morningSpots, dayIndex);
  const supportLocation = getFocusSpot(guide, secondaryFocus, dayIndex);

  const activities = [
    buildMorningActivity(destination, profile, guide, primaryFocus, dayIndex, timeSlots[0]),
    buildLateMorningActivity(destination, guide, secondaryFocus, dayIndex, timeSlots[1]),
    buildLunchActivity(profile, guide, dayIndex, timeSlots[2]),
    buildAfternoonActivity(destination, guide, primaryFocus === 'food' ? 'relax' : primaryFocus, dayIndex, timeSlots[3]),
    buildEveningActivity(destination, guide, profile, dayIndex, timeSlots[4])
  ];

  return {
    id: `${Date.now()}-${dayNo}-${Math.random().toString(36).slice(2, 6)}`,
    title: `${destination.name}${profile.days === 1 ? '定制日' : `第 ${dayNo} 天`} · ${stage}${focusTitle}`,
    time: timeSlots[0],
    location: `${coreLocation} · ${supportLocation}`,
    region: guide.region,
    cityName: destination.name,
    activities
  };
}

/**
 * 合并云端 AI 和本地模型的计划数据
 * 云端 AI 返回的计划数据优先——地名更真实、时间更灵活。
 * 当云端无数据时返回 null，由调用方走本地引擎兜底。
 * 
 * 调用方只需调用一次，无需每次修改逻辑。
 * 
 * @param {Array|null} cloudPlanData - 云端 AI 返回的 planData（已 normalize 后的数组）
 * @param {Object} profile - 用户画像（含 destination, days, pace, budget 等）
 * @returns {Array|null} planOptions 或 null
 */
function mergePlanData(cloudPlanData, profile) {
  if (cloudPlanData && Array.isArray(cloudPlanData) && cloudPlanData.length) {
    return [{
      variantKey: 'ai',
      variantLabel: 'AI推荐方案',
      variantIcon: '🤖',
      variantDesc: '云端AI根据你的需求智能生成的专属行程',
      profile: profile,
      days: cloudPlanData
    }];
  }
  return null;
}

// ==================== 预算 & 交通 ====================

function buildFullProfile(query, ctx) {
  const params = extractTripParams(query);
  const merged = mergeTripContext(ctx || {}, params);
  return {
    raw: query,
    destination: merged.destination || pickDestination(query),
    days: merged.days || extractDays(query) || 2,
    budget: merged.budget || extractBudget(query) || 'medium',
    pace: merged.pace || extractPace(query) || 'balanced',
    interests: merged.interests || extractInterests(query) || ['photo', 'food'],
    origin: merged.origin || extractOrigin(query) || ''
  };
}

function buildFullProfileFromContext(ctx) {
  return {
    raw: '',
    destination: ctx.destination,
    days: ctx.days || 3,
    budget: ctx.budget || 'medium',
    pace: ctx.pace || 'balanced',
    interests: ctx.interests || ['photo', 'food'],
    origin: ctx.origin || ''
  };
}

function isIslandOrFarDestination(destination) {
  const matchedText = `${destination.name || ''}${destination.region || ''}`;
  return /(海南|三亚|亚龙湾|鼓浪屿|厦门|西藏|拉萨|青海湖|呼伦贝尔|敦煌|西双版纳|稻城|亚丁)/.test(matchedText);
}

function inferTransportMode(profile) {
  if (!profile.destination) return 'rail';
  const destinationText = `${profile.destination.name || ''}${profile.destination.region || ''}`;
  if (profile.origin && destinationText.indexOf(profile.origin) !== -1) return 'local';
  if (isIslandOrFarDestination(profile.destination)) return 'flight';
  if (/(名胜古迹|古镇之旅|魅力城市)/.test(profile.destination.category || '')) return 'rail';
  return profile.origin ? 'flight' : 'rail';
}

function getTransportModeLabel(mode) {
  if (mode === 'flight') return '往返大交通';
  if (mode === 'local') return '本地或周边交通';
  return '往返高铁/火车';
}

function buildTransportAdvice(profile) {
  const originText = profile.origin ? `从${profile.origin}出发` : '这趟行程';
  const mode = inferTransportMode(profile);
  if (mode === 'local') return `${originText}更适合按周边短途来安排，交通成本会轻很多，可以把预算更多留给住宿和吃喝体验。`;
  if (mode === 'flight') return `${originText}更建议优先看直飞或中转时间短的航班，落地后先放行李再开始慢慢玩，整体节奏会更舒服。`;
  return `${originText}优先看高铁或动车更稳，市区落地后的接驳也更省心，适合这种 ${profile.days} 天节奏。`;
}

function buildBudgetAdvice(profile) {
  if (!profile.destination) return '';
  const transportMode = inferTransportMode(profile);
  const transportRange = transportBudgetByMode[transportMode][profile.budget];
  const nights = Math.max(profile.days - 1, 1);
  const stayRange = scaleRange(accommodationBudgetByLevel[profile.budget], nights);
  const foodRange = scaleRange(foodBudgetByLevel[profile.budget], profile.days);
  const localRange = scaleRange(localMoveBudgetByLevel[profile.budget], profile.days);
  const ticketBase = ticketBudgetByCategory[profile.destination.category] || [60, 180];
  const ticketRange = profile.days >= 3 ? scaleRange(ticketBase, 1.15) : ticketBase;
  const totalRange = sumRanges([transportRange, stayRange, foodRange, localRange, ticketRange]);
  const originText = profile.origin ? `从${profile.origin}出发，` : '';
  const budgetLabel = budgetLabels[profile.budget];

  return `${originText}按 ${profile.destination.name} ${profile.days} 天 ${budgetLabel}估算，人均大约 ${toRangeText(totalRange[0], totalRange[1])} 比较稳。\n\n📊 费用构成：\n• ${getTransportModeLabel(transportMode)}：${toRangeText(transportRange[0], transportRange[1])}\n• 住宿（${nights}晚）：${toRangeText(stayRange[0], stayRange[1])}\n• 吃喝：${toRangeText(foodRange[0], foodRange[1])}\n• 市内交通 + 门票：${toRangeText(localRange[0] + ticketRange[0], localRange[1] + ticketRange[1])}`;
}

function buildPlanLead(profile) {
  const interestSummary = getInterestSummary(profile.interests);
  return `我已经按 ${profile.days} 天、${interestSummary}、${paceLabels[profile.pace]} 和 ${budgetLabels[profile.budget]} 的思路把计划展开好了，下面可以直接查看并一键导入。`;
}

function getInterestSummary(interests) {
  return (interests || []).map((key) => interestLabels[key]).filter(Boolean).join('、') || '轻松出游';
}

// ==================== 必备物品推荐 ====================

/**
 * 根据目的地、季节、兴趣生成必备物品清单
 */
function getPackingRecommendations(destination, seasonOverride) {
  const season = seasonOverride || getCurrentSeason();
  const category = destination ? destination.category : '魅力城市';
  const items = [];
  const seen = new Set();

  function addItems(list) {
    for (let i = 0; i < list.length; i += 1) {
      if (!seen.has(list[i].item)) {
        seen.add(list[i].item);
        items.push(list[i]);
      }
    }
  }

  // 通用必备
  addItems(commonEssentials);

  // 按目的地类型
  const catItems = categoryEssentials[category];
  if (catItems) addItems(catItems);

  // 按季节
  const seasonItems = seasonEssentials[season];
  if (seasonItems) addItems(seasonItems);

  return {
    season: seasonMap[season].label,
    items
  };
}

/**
 * 根据兴趣扩展打包清单
 */
function getInterestPackingExtras(interests) {
  if (!interests || !interests.length) return [];
  const items = [];
  const seen = new Set();
  for (let i = 0; i < interests.length; i += 1) {
    const extra = interestEssentials[interests[i]];
    if (extra) {
      for (let j = 0; j < extra.length; j += 1) {
        if (!seen.has(extra[j].item)) {
          seen.add(extra[j].item);
          items.push(extra[j]);
        }
      }
    }
  }
  return items;
}

/**
 * 生成打包清单文本
 */
function formatPackingList(packingData, interestExtras) {
  const lines = [];
  lines.push('🎒 **出行必备清单**');
  lines.push('');

  // 按类别分组
  const groups = {};
  const allItems = packingData.items.concat(interestExtras || []);
  for (let i = 0; i < allItems.length; i += 1) {
    const item = allItems[i];
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }

  const categoryOrder = ['证件', '电子', '衣物', '鞋履', '防护', '装备', '日用', '食物', '健康'];
  for (let i = 0; i < categoryOrder.length; i += 1) {
    const cat = categoryOrder[i];
    if (groups[cat] && groups[cat].length) {
      lines.push(`**${cat}**`);
      for (let j = 0; j < groups[cat].length; j += 1) {
        lines.push(`  ${groups[cat][j].icon} ${groups[cat][j].item}`);
      }
      lines.push('');
    }
  }

  lines.push(`> 📌 以上清单基于${packingData.season}出行整理，具体可根据实际天气和个人习惯调整。`);
  return lines.join('\n');
}

// ==================== 主入口：智能AI回复 ====================

/**
 * 核心方法：根据用户输入和对话上下文生成智能回复
 *
 * @param {string} message - 用户输入
 * @param {object} context - 对话上下文 { destination, days, budget, pace, interests, origin }
 * @returns {{
 *   reply: string,
 *   questionType: string,
 *   planOptions: Array|null,
 *   packingList: string|null,
 *   context: object,
 *   readyToGenerate: boolean
 * }}
 */
function getAIResponse(message, context) {
  const ctx = context || {};
  const questionType = classifyQuestion(message);
  let reply = '';
  let planOptions = null;
  let packingList = null;
  let readyToGenerate = false;
  let newContext = Object.assign({}, ctx);

  switch (questionType) {
    case 'greeting':
      reply = buildGreetingReply();
      break;

    case 'packing_inquiry': {
      const params = extractTripParams(message);
      const merged = mergeTripContext(ctx, params);
      newContext = merged;
      if (merged.destination) {
        const packing = getPackingRecommendations(merged.destination);
        const extras = getInterestPackingExtras(merged.interests || []);
        reply = formatPackingList(packing, extras);
        packingList = formatPackingList(packing, extras);
      } else {
        reply = '我可以帮你整理出行必备清单！先告诉我你去哪里、什么季节出发，比如"去三亚要带什么"或"冬天去北京必备物品"。';
      }
      break;
    }

    case 'budget_inquiry': {
      const params = extractTripParams(message);
      const merged = mergeTripContext(ctx, params);
      newContext = merged;
      reply = buildBudgetReply(message, merged);
      break;
    }

    case 'transport_inquiry': {
      const params = extractTripParams(message);
      const merged = mergeTripContext(ctx, params);
      newContext = merged;
      reply = buildTransportReply(message, merged);
      break;
    }

    case 'destination_inquiry': {
      const params = extractTripParams(message);
      newContext = mergeTripContext(ctx, params);
      reply = buildDestinationInquiryReply(message);
      break;
    }

    case 'weather_inquiry': {
      const params = extractTripParams(message);
      const merged = mergeTripContext(ctx, params);
      newContext = merged;
      reply = buildWeatherReply(message, merged);
      break;
    }

    case 'plan_request': {
      const params = extractTripParams(message);
      const merged = mergeTripContext(ctx, params);
      newContext = merged;

      // 检查用户是否确认"直接生成"
      if (/(就这样|直接出|出方案|生成吧|可以了|没问题|开始|OK|行|好|是的|对|确认|就这样出方案)/.test(message) && ctx.destination) {
        // 用户确认，强制生成
        const readyCtx = Object.assign({}, merged, {
          days: merged.days || 2,
          budget: merged.budget || 'medium',
          interests: merged.interests || ['photo', 'food']
        });
        newContext = readyCtx;
        planOptions = generateMultiOptions(message, readyCtx);
        if (planOptions.length) {
          reply = buildPlanReadyReply(readyCtx);
          readyToGenerate = true;
        }
      } else {
        const result = buildPlanRequestReply(message, ctx);
        newContext = result.context;
        if (result.readyToGenerate) {
          planOptions = generateMultiOptions(message, newContext);
          reply = result.reply;
          readyToGenerate = true;
        } else {
          reply = result.reply;
          readyToGenerate = false;
        }
      }
      break;
    }

    case 'general_question':
    default: {
      const params = extractTripParams(message);
      newContext = mergeTripContext(ctx, params);

      // 检查是否隐含规划意图
      if ((params.destination || params.days || hasDestinationHint(message)) &&
          /(玩|去|帮|怎么|行程|旅游|旅行|推荐)/.test(message)) {
        if (isTripInfoComplete(newContext)) {
          planOptions = generateMultiOptions(message, newContext);
          reply = buildPlanReadyReply(newContext);
          readyToGenerate = true;
        } else {
          const result = buildPlanRequestReply(message, ctx);
          newContext = result.context;
          reply = result.reply;
          readyToGenerate = false;
        }
      } else if (params.destination) {
        reply = `关于${params.destination.name}，你想了解哪方面的信息呢？\n\n• 行程规划和路线\n• 预算和费用估算\n• 交通出行方式\n• 出行必备物品\n• 最佳旅行季节\n\n直接告诉我你的需求，我帮你具体分析~`;
      } else {
        reply = '我主要擅长帮你做旅行规划和出行建议。你可以告诉我：\n\n• 想去哪里、玩几天、预算多少\n• 需要带什么必需品\n• 交通和住宿怎么选\n\n直接说出你的需求，比如"三亚3天拍照美食"，我就能给你出方案！';
      }
      break;
    }
  }

  return {
    reply,
    questionType,
    planOptions,
    packingList,
    context: newContext,
    readyToGenerate
  };
}

// ==================== 兼容旧接口 ====================

function shouldGeneratePlan(message) {
  const query = normalizeQuery(message);
  if (!query) return false;
  if (/^(你好|您好|hi|hello|在吗|你是谁|你会什么|怎么用|介绍一下)$/i.test(query)) return false;
  if (hasDestinationMention(query)) return true;
  if (/(\d+)\s*天/.test(query)) return true;
  return /(规划|行程|攻略|路线|怎么玩|怎么安排|推荐|适合|值得去|打卡|假期|旅行|旅游|出游|自由行|周末出发|帮我|想去|打算去|准备去|想玩|适合我)/.test(query);
}

function getTravelChatReply(message) {
  const result = getAIResponse(message, null);
  return result.reply;
}

function getPlanningReply(prompt) {
  const query = normalizeQuery(prompt);
  const ctx = {};
  const params = extractTripParams(query);
  if (params.destination) ctx.destination = params.destination;
  if (params.days) ctx.days = params.days;
  if (params.budget) ctx.budget = params.budget;
  if (params.interests) ctx.interests = params.interests;
  if (params.origin) ctx.origin = params.origin;
  if (params.pace) ctx.pace = params.pace;

  const result = getAIResponse(prompt, ctx);
  return result.reply;
}

function getAIPlanning(prompt) {
  const result = getAIResponse(prompt, null);
  if (result.planOptions && result.planOptions.length) {
    return result.planOptions[0].days || [];
  }
  return [];
}

function parseActivity(text) {
  const matched = (text || '').match(/^(\d{1,2}:\d{2}(?:\s*-\s*\d{1,2}:\d{2})?)\s*(.*)$/);
  if (matched) return { time: matched[1], desc: matched[2] };
  return { time: '', desc: text || '' };
}

function getActivityMeta(desc) {
  if (/(美食|餐|咖啡|茶|夜市)/.test(desc)) return { icon: '🍽️', tag: '特色推荐', color: '#c2410c', light: '#fff7ed', border: '#fdba74' };
  if (/(酒店|民宿|入住|休息|客栈)/.test(desc)) return { icon: '🏨', tag: '舒适休憩', color: '#4338ca', light: '#eef2ff', border: '#c7d2fe' };
  if (/(出发|抵达|航班|高铁|地铁|交通|公共交通)/.test(desc)) return { icon: '🚗', tag: '轻松出行', color: '#1d4ed8', light: '#eff6ff', border: '#bfdbfe' };
  if (/(拍照|摄影|机位|日落|夜景)/.test(desc)) return { icon: '📷', tag: '出片圣地', color: '#be185d', light: '#fdf2f8', border: '#f9a8d4' };
  if (/(购物|伴手礼|集市|逛街|街区)/.test(desc)) return { icon: '🛍️', tag: '伴手礼', color: '#7e22ce', light: '#faf5ff', border: '#d8b4fe' };
  return { icon: '📍', tag: '必游景点', color: '#0f766e', light: '#f0fdfa', border: '#99f6e4' };
}

module.exports = {
  classifyQuestion,
  extractTripParams,
  getAIResponse,
  getPackingRecommendations,
  getInterestPackingExtras,
  formatPackingList,
  generateMultiOptions,
  mergePlanData,
  // 兼容旧接口
  getTravelChatReply,
  getPlanningReply,
  shouldGeneratePlan,
  getAIPlanning,
  parseActivity,
  getActivityMeta
};
