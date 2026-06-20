const store = require('../../utils/store');

Page({
  data: {
    favorites: []
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '我的收藏' });
  },
  onShow() {
    const user = store.getCurrentUser();
    this.setData({
      favorites: user ? user.favorites || [] : []
    });
  },
  openDestination(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  }
});
