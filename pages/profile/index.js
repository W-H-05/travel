const store = require('../../utils/store');

Page({
  data: {
    user: null,
    achievements: [],
    unlockedCount: 0,
    selectedAchievement: null
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '我的' });
  },
  onShow() {
    wx.showTabBar();
    const user = store.getCurrentUser();
    const achievements = store.mergeAchievements(user);
    this.setData({
      user,
      achievements,
      unlockedCount: achievements.filter((item) => item.date !== '--').length
    });
  },
  goLogin() {
    wx.reLaunch({ url: '/pages/login/index' });
  },
  openPage(event) {
    const { url } = event.currentTarget.dataset;
    if (!this.data.user && url !== '/pages/login/index') {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({ url });
  },
  previewAchievement(event) {
    const { index } = event.currentTarget.dataset;
    this.setData({ selectedAchievement: this.data.achievements[index] });
  },
  closeAchievement() {
    this.setData({ selectedAchievement: null });
  },
  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后将返回登录页。',
      success: (res) => {
        if (res.confirm) {
          store.logout();
          wx.reLaunch({ url: '/pages/login/index' });
        }
      }
    });
  }
});
