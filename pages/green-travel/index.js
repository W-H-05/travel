const { publicActivities } = require('../../utils/data');

Page({
  data: {
    activities: publicActivities
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '绿色行' });
  },
  openActivity(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/activity-detail/index?id=${id}` });
  }
});
