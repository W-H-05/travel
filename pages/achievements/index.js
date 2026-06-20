const store = require('../../utils/store');

Page({
  data: {
    achievements: [],
    unlockedCount: 0
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '我的成就' });
  },
  onShow() {
    const achievements = store.mergeAchievements();
    this.setData({
      achievements,
      unlockedCount: achievements.filter((item) => item.date !== '--').length
    });
  }
});
