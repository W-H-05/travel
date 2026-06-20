const store = require('../../utils/store');
const { parseActivity, getActivityMeta } = require('../../utils/ai');

const LEFT_X = 168;
const RIGHT_X = 518;
const ROW_HEIGHT = 320;
const TOP_OFFSET = 116;
const BOTTOM_PADDING = 208;

function toSegmentStyle(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  return `left:${midX}rpx;top:${midY}rpx;width:${length.toFixed(2)}rpx;transform:translate(-50%, -50%) rotate(${angle.toFixed(2)}deg);`;
}

function buildPathSegments(cards) {
  if (!cards || cards.length <= 1) {
    return [];
  }
  const segments = [];
  for (let index = 0; index < cards.length - 1; index += 1) {
    const current = cards[index];
    const next = cards[index + 1];
    const direction = next.anchorX > current.anchorX ? 1 : -1;
    const points = [
      { x: current.anchorX, y: current.anchorY },
      { x: current.anchorX + direction * 92, y: current.anchorY + 34 },
      { x: next.anchorX - direction * 108, y: next.anchorY - 86 },
      { x: next.anchorX, y: next.anchorY }
    ];
    for (let pointIndex = 0; pointIndex < points.length - 1; pointIndex += 1) {
      segments.push({
        id: `${index}-${pointIndex}`,
        style: toSegmentStyle(points[pointIndex], points[pointIndex + 1])
      });
    }
  }
  return segments;
}

function buildActivityCards(activities) {
  return (activities || []).map((activity, index, list) => {
    const parsed = parseActivity(activity);
    const meta = getActivityMeta(parsed.desc);
    const isLeft = index % 2 === 0;
    const isLast = index === list.length - 1;
    const anchorX = isLeft ? LEFT_X : RIGHT_X;
    const anchorY = TOP_OFFSET + index * ROW_HEIGHT;
    const rotate = isLeft ? -2 : 2;
    return Object.assign({}, parsed, meta, {
      id: `${index}-${parsed.time || 'activity'}`,
      step: index + 1,
      isLast,
      anchorX,
      anchorY,
      rotation: rotate,
      wrapperStyle: `top:${anchorY}rpx;left:${anchorX}rpx;`,
      cardStyle: `transform:translateX(-50%) rotate(${rotate}deg);`,
      tagStyle: `background:${meta.light};color:${meta.color};border:2rpx solid ${meta.border || 'transparent'};`
    });
  });
}

Page({
  data: {
    plan: null,
    activityCards: [],
    pathSegments: [],
    stageHeight: 0,
    showDeleteConfirm: false
  },
  onLoad(options) {
    const plan = store.getPlans().find((item) => item.id === String(options.id));
    if (!plan) {
      return;
    }
    wx.setNavigationBarTitle({ title: '行程详情' });
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#e8d5a5'
    });
    const activityCards = buildActivityCards(plan.activities);
    this.setData({
      plan,
      activityCards,
      pathSegments: buildPathSegments(activityCards),
      stageHeight: activityCards.length ? activityCards.length * ROW_HEIGHT + BOTTOM_PADDING : 440
    });
  },
  openDeleteConfirm() {
    this.setData({ showDeleteConfirm: true });
  },
  closeDeleteConfirm() {
    this.setData({ showDeleteConfirm: false });
  },
  confirmDelete() {
    if (!this.data.plan) {
      return;
    }
    store.deletePlan(this.data.plan.id);
    wx.showToast({ title: '已删除行程', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack({ delta: 1 });
    }, 300);
  }
});
