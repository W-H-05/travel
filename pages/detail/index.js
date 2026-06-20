const { getDestinationById } = require('../../utils/data');
const { getAIPlanning } = require('../../utils/ai');
const store = require('../../utils/store');
const achievementFeedback = require('../../utils/achievement-feedback');

Page({
  data: {
    destination: null,
    gallery: [],
    activeSection: 'info',
    isFavorited: false,
    achievementPopupVisible: false,
    achievementPopup: null,
    achievementQueue: [],
    communityReviews: [
      { name: '旅行达人_Aki', level: 'Lv.5', content: '建议把最好看的机位放在傍晚，光线柔和很多，照片层次也更干净。', image: 'https://picsum.photos/seed/review1/320/320' },
      { name: '山海漫游', level: 'Lv.4', content: '如果你想慢慢逛，建议给这里至少留一整天，不要把节奏排得太满。', image: 'https://picsum.photos/seed/review2/320/320' },
      { name: '镜头旅人', level: 'Lv.6', content: '清晨人少的时候非常适合拍照，也更容易感受到这个地方真正的气质。', image: 'https://picsum.photos/seed/review3/320/320' }
    ]
  },
  onLoad(options) {
    const destination = getDestinationById(options.id);
    if (destination) {
      wx.setNavigationBarTitle({ title: destination.name });
      this.setData({
        destination,
        gallery: [
          `https://picsum.photos/seed/${destination.id}scene1/600/420`,
          `https://picsum.photos/seed/${destination.id}scene2/600/420`
        ]
      });
    }
  },
  onShow() {
    const user = store.getCurrentUser();
    const destination = this.data.destination;
    this.setData({
      isFavorited: !!(user && destination && user.favorites.some((item) => item.id === destination.id))
    });
  },
  onUnload() {
    achievementFeedback.clear(this);
  },
  handleAchievementClose() {
    achievementFeedback.advance(this);
  },
  switchSection(event) {
    this.setData({ activeSection: event.currentTarget.dataset.key });
  },
  toggleFavorite() {
    const destination = this.data.destination;
    if (!destination) {
      return;
    }
    const result = store.toggleFavorite(destination);
    if (!result.ok) {
      wx.showModal({
        title: '需要登录',
        content: '登录后才能保存收藏景点。',
        success: (res) => {
          if (res.confirm) {
            wx.reLaunch({ url: '/pages/login/index' });
          }
        }
      });
      return;
    }
    this.setData({ isFavorited: result.favorited });
    if (!achievementFeedback.hasUnlocks(result.unlocked)) {
      wx.showToast({ title: result.favorited ? '已加入收藏' : '已取消收藏', icon: 'none' });
    }
    achievementFeedback.queue(this, result.unlocked);
  },
  addToPlan() {
    const destination = this.data.destination;
    if (!destination) {
      return;
    }
    const result = store.addPlans(getAIPlanning(`${destination.name} 2天 轻松 拍照 美食`), { source: 'manual' });
    if (achievementFeedback.hasUnlocks(result.unlocked)) {
      achievementFeedback.queue(this, result.unlocked, () => {
        wx.switchTab({ url: '/pages/plan/index' });
      });
      return;
    }
    wx.showToast({ title: '已加入规划', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/plan/index' });
    }, 380);
  }
});
