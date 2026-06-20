const store = require('../../utils/store');

Page({
  data: {
    plans: []
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '我的规划' });
  },
  onShow() {
    wx.showTabBar();
    this.setData({ plans: store.getPlans() });
  },
  openPlan(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/itinerary/index?id=${id}` });
  }
});
