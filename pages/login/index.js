const store = require('../../utils/store');

Page({
  onShow() {
    wx.hideTabBar();
  },
  handleWechatLogin() {
    store.loginAsWechat();
    wx.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => {
      wx.reLaunch({ url: '/pages/home/index' });
    }, 300);
  },
  handleGuestBrowse() {
    store.setGuestMode(true);
    wx.reLaunch({ url: '/pages/home/index' });
  }
});
