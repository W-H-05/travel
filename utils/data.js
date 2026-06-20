const publicActivities = [
  {
    id: 'a1',
    title: '海滩垃圾清理',
    location: '厦门 · 黄厝海滩',
    points: 30,
    color: '#38bdf8',
    description: '用一场轻松的海边志愿活动，换回更干净的海岸线。大家会一起完成垃圾分类、海滩巡护和环保倡议拍照打卡。',
    tasks: ['签到领取清理工具', '在指定海岸区域收集塑料垃圾', '将垃圾分类并投放至回收点', '合影留念并分享环保心得']
  },
  {
    id: 'a2',
    title: '森林防火宣传',
    location: '四川 · 雅安',
    points: 20,
    color: '#22c55e',
    description: '秋冬是森林防火高风险季，活动将协助景区完成游客引导、宣传册派发与重点区域巡查。',
    tasks: ['参加防火知识速训', '在景区入口发放宣传册', '向游客讲解防火注意事项', '协助巡查重点防火区域']
  },
  {
    id: 'a3',
    title: '古村落墙面修缮',
    location: '安徽 · 宏村',
    points: 50,
    color: '#ca8a04',
    description: '跟随专业老师一起参与古村墙面修补，认识传统工艺，也为文化遗产保护出一份力。',
    tasks: ['学习基础墙面修缮知识', '协助准备颜料与修补材料', '在指导下完成局部修补', '清理现场并整理工具']
  },
  {
    id: 'a4',
    title: '高原环保志愿者',
    location: '西藏 · 林芝',
    points: 100,
    color: '#0f766e',
    description: '在高原环境保护行动中参与植树、景区垃圾清理和游客文明出游宣传，守护雪域高原的纯净风景。',
    tasks: ['完成高原安全与适应说明', '参与植树造林活动', '清理景区及沿途垃圾', '向游客宣传高原环保理念']
  }
];

const destinations = [
  { id: '1', name: '黄山风景区', region: '安徽 · 黄山', description: '以奇松、怪石、云海和日出闻名，是四季都适合慢游的山岳名片。', image: 'https://picsum.photos/seed/huangshan/640/820', category: '自然风光' },
  { id: '2', name: '九寨沟', region: '四川 · 阿坝', description: '彩林、海子与雪峰交织成层次分明的高原童话，秋季尤其惊艳。', image: 'https://picsum.photos/seed/jiuzhaigou/640/820', category: '自然风光' },
  { id: '3', name: '阳朔西街', region: '广西 · 桂林', description: '喀斯特山水包围着烟火小城，适合骑行、漫步和体验夜晚氛围。', image: 'https://picsum.photos/seed/yangshuo/640/820', category: '魅力城市' },
  { id: '4', name: '鼓浪屿', region: '福建 · 厦门', description: '老别墅、巷子与海风共同构成浪漫海岛气质，适合轻度假。', image: 'https://picsum.photos/seed/gulangyu/640/820', category: '海滨度假' },
  { id: '5', name: '丽江古城', region: '云南 · 丽江', description: '石板路与水系交织出慵懒古城节奏，夜色和清晨都值得慢慢感受。', image: 'https://picsum.photos/seed/lijiang/640/820', category: '古镇之旅' },
  { id: '6', name: '张家界国家森林公园', region: '湖南 · 张家界', description: '峰林奇景极具辨识度，适合徒步、索道观景和轻探险。', image: 'https://picsum.photos/seed/zhangjiajie/640/820', category: '森林公园' },
  { id: '7', name: '三亚亚龙湾', region: '海南 · 三亚', description: '海水清澈、沙质细软，是放松度假和拍海边大片的热门目的地。', image: 'https://picsum.photos/seed/yalongbay/640/820', category: '海滨度假' },
  { id: '8', name: '故宫博物院', region: '北京', description: '厚重历史感与宏大中轴秩序并存，适合沉浸式感受古都文化。', image: 'https://picsum.photos/seed/forbiddencity/640/820', category: '名胜古迹' },
  { id: '9', name: '敦煌莫高窟', region: '甘肃 · 酒泉', description: '丝路文明与壁画艺术在这里浓缩成一次极有张力的文化旅行。', image: 'https://picsum.photos/seed/mogao/640/820', category: '沙漠探险' },
  { id: '10', name: '黄果树瀑布', region: '贵州 · 安顺', description: '水势浩大、观景层次丰富，是西南旅行中极具冲击力的一站。', image: 'https://picsum.photos/seed/huangguoshu/640/820', category: '壮丽瀑布' },
  { id: '11', name: '稻城亚丁', region: '四川 · 甘孜', description: '雪山、草甸和湖泊层层递进，像一张被拉满饱和度的高原明信片。', image: 'https://picsum.photos/seed/yading/640/820', category: '自然风光' },
  { id: '12', name: '乌镇', region: '浙江 · 嘉兴', description: '白墙黛瓦与水巷相连，适合住一晚慢慢感受江南气质。', image: 'https://picsum.photos/seed/wuzhen/640/820', category: '古镇之旅' },
  { id: '13', name: '长白山天池', region: '吉林 · 延边', description: '火山口湖景纯净开阔，冬夏都有完全不同的旅行体验。', image: 'https://picsum.photos/seed/changbai/640/820', category: '自然风光' },
  { id: '14', name: '布达拉宫', region: '西藏 · 拉萨', description: '极具力量感的地标建筑，既庄严又带有强烈地域文化印记。', image: 'https://picsum.photos/seed/potala/640/820', category: '名胜古迹' },
  { id: '15', name: '西双版纳热带植物园', region: '云南 · 西双版纳', description: '热带植被密度高，适合雨林漫步和轻松科普型旅行。', image: 'https://picsum.photos/seed/xishuangbanna/640/820', category: '森林公园' },
  { id: '16', name: '青海湖', region: '青海 · 海北', description: '视野开阔、光线通透，是非常适合公路旅行的高原湖泊。', image: 'https://picsum.photos/seed/qinghaihu/640/820', category: '自然风光' },
  { id: '17', name: '平遥古城', region: '山西 · 晋中', description: '城墙、票号与古街完整保留，适合感受旧时市井生活。', image: 'https://picsum.photos/seed/pingyao/640/820', category: '古镇之旅' },
  { id: '18', name: '武夷山', region: '福建 · 南平', description: '丹霞地貌与茶文化结合得很自然，适合徒步和坐竹筏。', image: 'https://picsum.photos/seed/wuyishan/640/820', category: '自然风光' },
  { id: '19', name: '峨眉山', region: '四川 · 乐山', description: '兼具佛教文化与山地景观，适合周末短线和慢节奏登山。', image: 'https://picsum.photos/seed/emeishan/640/820', category: '名胜古迹' },
  { id: '20', name: '呼伦贝尔大草原', region: '内蒙古 · 呼伦贝尔', description: '适合看日落、露营和体验辽阔草原的节奏感。', image: 'https://picsum.photos/seed/hulunbuir/640/820', category: '野外露营' }
];

const allAchievements = [
  { id: '1', name: '初探世界', image: 'https://picsum.photos/seed/explore/160/160', date: '--', description: '首次完成一条旅行打卡记录' },
  { id: '2', name: '旅行达人', image: 'https://picsum.photos/seed/travel/160/160', date: '--', description: '累计完成 10 次打卡' },
  { id: '3', name: '环保守卫', image: 'https://picsum.photos/seed/leaf/160/160', date: '--', description: '绿色积分达到 100 分' },
  { id: '4', name: '有旅有伴', image: 'https://picsum.photos/seed/friends/160/160', date: '--', description: '首次在找搭子中完成一次互动' },
  { id: '5', name: '摄影大师', image: 'https://picsum.photos/seed/camera/160/160', date: '--', description: '连续收藏 5 组灵感摄影作品' },
  { id: '6', name: '攻略王者', image: 'https://picsum.photos/seed/guide/160/160', date: '--', description: '浏览并收藏 5 篇社区攻略' },
  { id: '7', name: '足迹遍布', image: 'https://picsum.photos/seed/footprint/160/160', date: '--', description: '在 5 个不同地区留下足迹' },
  { id: '8', name: '低碳先锋', image: 'https://picsum.photos/seed/eco/160/160', date: '--', description: '连续 7 天坚持绿色出行打卡' },
  { id: '9', name: '计划通', image: 'https://picsum.photos/seed/plan/160/160', date: '--', description: '首次将行程加入我的规划' },
  { id: '10', name: 'AI体验官', image: 'https://picsum.photos/seed/ai/160/160', date: '--', description: '首次使用 AI 助手生成行程' },
  { id: '11', name: '社交达人', image: 'https://picsum.photos/seed/social/160/160', date: '--', description: '成功添加 3 位旅行搭子' },
  { id: '12', name: '公益大使', image: 'https://picsum.photos/seed/charity/160/160', date: '--', description: '累计完成 3 场公益活动' },
  { id: '13', name: '收藏家', image: 'https://picsum.photos/seed/collect/160/160', date: '--', description: '收藏 10 个及以上景点' },
  { id: '14', name: '夜猫子', image: 'https://picsum.photos/seed/night/160/160', date: '--', description: '在 23:00 至 04:00 之间完成一次打卡' },
  { id: '15', name: '大满贯', image: 'https://picsum.photos/seed/crown/160/160', date: '--', description: '解锁其余所有成就' }
];

const communityPosts = [
  { id: '1', title: '川西秘境 5 日游全攻略', author: '旅行家小昕', avatar: 'https://picsum.photos/seed/avatar1/120/120', img: 'https://picsum.photos/seed/plateau/640/880', likes: 128, content: '从成都出发一路向西，途经康定、新都桥和理塘，建议提前准备好防晒、保暖外套和抗高反药品。新都桥适合清晨拍照，理塘和稻城则更适合慢节奏停留。整条线风景非常出片，但山路较多，更建议自驾经验充足的伙伴出行。' },
  { id: '2', title: '大理洱海环湖骑行指南', author: '风一样的鹿', avatar: 'https://picsum.photos/seed/avatar2/120/120', img: 'https://picsum.photos/seed/bicycle/640/880', likes: 85, content: '推荐从大理古城出发，沿生态廊道一路骑到喜洲再到双廊。整段路线节奏舒缓，适合分两天完成。喜洲适合停下来吃乳扇和粑粑，傍晚去双廊看日落尤其舒服。记得准备防晒和轻便外套。' },
  { id: '3', title: '杭州西湖赏秋绝佳路线', author: '江南烟雨', avatar: 'https://picsum.photos/seed/avatar3/120/120', img: 'https://picsum.photos/seed/autumn/640/880', likes: 210, content: '秋天的西湖特别适合慢走，推荐从断桥一路步行到平湖秋月，再去曲院风荷周边逛一圈。傍晚时分去雷峰塔附近看落日，光线很柔和，沿湖拍人像也非常好看。时间充裕的话可以顺便去灵隐寺感受一下安静氛围。' },
  { id: '4', title: '三亚免税店购物避坑指南', author: '购物狂魔', avatar: 'https://picsum.photos/seed/avatar4/120/120', img: 'https://picsum.photos/seed/shopping/640/880', likes: 342, content: '去三亚之前建议提前注册会员并列好购物清单，避免临场冲动消费。热门美妆和香水经常有活动，但不同店铺折扣并不完全一致。离岛前至少提前 6 小时完成下单会更稳妥，行程紧张的话可以优先选择邮寄到家。' },
  { id: '5', title: '新疆喀纳斯秋色实拍', author: '光影猎手', avatar: 'https://picsum.photos/seed/avatar5/120/120', img: 'https://picsum.photos/seed/forestlake/640/880', likes: 512, content: '喀纳斯的秋天像打翻了调色盘，金黄白桦林、深绿针叶林和湖面的蓝一起出现，层次感很强。建议清晨去观鱼台俯瞰，雾气和逆光都很有氛围。想拍星空的话可以考虑在禾木多住一晚，夜里真的很安静。' }
];

const categories = [
  { name: '魅力城市', img: 'https://picsum.photos/seed/city/320/320' },
  { name: '自然风光', img: 'https://picsum.photos/seed/nature/320/320' },
  { name: '壮丽瀑布', img: 'https://picsum.photos/seed/waterfall/320/320' },
  { name: '野外露营', img: 'https://picsum.photos/seed/camping/320/320' },
  { name: '海滨度假', img: 'https://picsum.photos/seed/beach/320/320' },
  { name: '名胜古迹', img: 'https://picsum.photos/seed/heritage/320/320' },
  { name: '森林公园', img: 'https://picsum.photos/seed/forest/320/320' },
  { name: '沙漠探险', img: 'https://picsum.photos/seed/desert/320/320' },
  { name: '古镇之旅', img: 'https://picsum.photos/seed/oldtown/320/320' }
];

const rankingLists = {
  nation: [
    { id: '11', name: '稻城亚丁', region: '四川 · 甘孜', description: '雪山草甸湖泊层层递进，是很多人心中的高原白月光。', image: 'https://picsum.photos/seed/rank1/320/320' },
    { id: '16', name: '青海湖', region: '青海', description: '开阔湖景和公路旅行氛围非常适合夏秋出行。', image: 'https://picsum.photos/seed/rank2/320/320' },
    { id: '6', name: '张家界', region: '湖南', description: '峰林立体感极强，徒步和索道都值得安排。', image: 'https://picsum.photos/seed/rank3/320/320' },
    { id: '21', name: '茶卡盐湖', region: '青海', description: '天空之镜在天气好的时候确实很震撼。', image: 'https://picsum.photos/seed/rank4/320/320' },
    { id: '5', name: '丽江古城', region: '云南', description: '适合慢住和逛街，夜晚氛围感很足。', image: 'https://picsum.photos/seed/rank5/320/320' }
  ],
  global: [
    { id: 'g1', name: '马尔代夫', region: '印度洋', description: '海岛度假天花板之一，适合放空和浮潜。', image: 'https://picsum.photos/seed/global1/320/320' },
    { id: 'g2', name: '巴黎', region: '法国', description: '浪漫街区、博物馆和河畔步行都非常迷人。', image: 'https://picsum.photos/seed/global2/320/320' },
    { id: 'g3', name: '京都', region: '日本', description: '古寺、町屋和季节限定风景结合得很自然。', image: 'https://picsum.photos/seed/global3/320/320' },
    { id: 'g4', name: '巴厘岛', region: '印度尼西亚', description: '海滩、泳池和度假感并存，适合休闲旅行。', image: 'https://picsum.photos/seed/global4/320/320' },
    { id: 'g5', name: '罗马', region: '意大利', description: '历史遗迹密度很高，街头走走也很有味道。', image: 'https://picsum.photos/seed/global5/320/320' }
  ]
};

const photographyRegions = ['全部', '云南', '川藏', '江南', '大漠', '滨海'];

const photographyWorks = [
  { id: 1, title: '玉龙雪山日照金山', author: '追光者', img: 'https://picsum.photos/seed/photo1/640/960', region: '云南' },
  { id: 2, title: '大理洱海晨雾', author: '云端漫步', img: 'https://picsum.photos/seed/photo2/640/960', region: '云南' },
  { id: 3, title: '布达拉宫夜景', author: '雪域孤狼', img: 'https://picsum.photos/seed/photo3/640/960', region: '川藏' },
  { id: 4, title: '稻城亚丁秋色', author: '行者无界', img: 'https://picsum.photos/seed/photo4/640/960', region: '川藏' },
  { id: 5, title: '乌镇水乡清晨', author: '江南烟雨', img: 'https://picsum.photos/seed/photo5/640/960', region: '江南' },
  { id: 6, title: '西湖断桥薄雾', author: '苏堤春晓', img: 'https://picsum.photos/seed/photo6/640/960', region: '江南' },
  { id: 7, title: '敦煌鸣沙山', author: '大漠孤烟', img: 'https://picsum.photos/seed/photo7/640/960', region: '大漠' },
  { id: 8, title: '胡杨林秋韵', author: '长河落日', img: 'https://picsum.photos/seed/photo8/640/960', region: '大漠' },
  { id: 9, title: '三亚海湾日落', author: '海风拂面', img: 'https://picsum.photos/seed/photo9/640/960', region: '滨海' },
  { id: 10, title: '鼓浪屿转角街景', author: '琴岛之恋', img: 'https://picsum.photos/seed/photo10/640/960', region: '滨海' },
  { id: 11, title: '丽江古城夜色', author: '星空旅人', img: 'https://picsum.photos/seed/photo11/640/960', region: '云南' },
  { id: 12, title: '色达红房子', author: '信仰的力量', img: 'https://picsum.photos/seed/photo12/640/960', region: '川藏' }
];

const initialBuddies = [
  { id: '1', name: '小鹿', age: 24, gender: '女', hobbies: '摄影、登山', desc: '打算下周去丽江，想找一个节奏合拍的搭子。', wx: 'luck_lu', avatar: 'https://picsum.photos/seed/buddy1/120/120', isMine: false },
  { id: '2', name: '阿强', age: 28, gender: '男', hobbies: '露营、自驾', desc: '计划自驾去川西，想找会拍照也能聊天的伙伴。', wx: 'qiang_007', avatar: 'https://picsum.photos/seed/buddy2/120/120', isMine: false },
  { id: '3', name: '米雪', age: 22, gender: '女', hobbies: '美食、打卡', desc: '成都周末探店路线已经列好啦，有人一起吗？', wx: 'mimi_snow', avatar: 'https://picsum.photos/seed/buddy3/120/120', isMine: false },
  { id: '4', name: '大山', age: 36, gender: '男', hobbies: '徒步、越野', desc: '周末去四姑娘山轻徒步，缺一位靠谱队友。', wx: 'dashan_35', avatar: 'https://picsum.photos/seed/buddy4/120/120', isMine: false },
  { id: '5', name: '静静', age: 29, gender: '女', hobbies: '看展、咖啡', desc: '想找人一起看展再拍照，主打轻松随意。', wx: 'jing_art', avatar: 'https://picsum.photos/seed/buddy5/120/120', isMine: false }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getDestinationById(id) {
  const local = destinations.find((item) => item.id === String(id));
  if (local) {
    return clone(local);
  }
  return clone(rankingLists.nation.concat(rankingLists.global).find((item) => item.id === String(id)) || null);
}

function getActivityById(id) {
  return clone(publicActivities.find((item) => item.id === String(id)) || null);
}

function getPostById(id) {
  return clone(communityPosts.find((item) => item.id === String(id)) || null);
}

function getCategoryDestinations(category) {
  return clone(destinations.filter((item) => item.category === category));
}

function searchDestinations(keyword) {
  const query = (keyword || '').trim();
  if (!query) {
    return [];
  }
  return clone(destinations.filter((item) => [item.name, item.region, item.description, item.category].some((field) => field && field.indexOf(query) !== -1)));
}

module.exports = {
  publicActivities,
  destinations,
  allAchievements,
  communityPosts,
  categories,
  rankingLists,
  photographyRegions,
  photographyWorks,
  initialBuddies,
  getDestinationById,
  getActivityById,
  getPostById,
  getCategoryDestinations,
  searchDestinations,
  clone
};
