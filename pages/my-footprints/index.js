const store = require('../../utils/store');

Page({
  data: {
    checkIns: []
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '我的足迹' });
  },
  onShow() {
    const user = store.getCurrentUser();
    this.setData({
      checkIns: user ? user.checkIns || [] : []
    });
  }
});
