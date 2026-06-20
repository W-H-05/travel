const store = require('../../utils/store');

Page({
  data: {
    user: null,
    activities: []
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '我的公益活动' });
  },
  onShow() {
    const user = store.getCurrentUser();
    this.setData({
      user,
      activities: user ? (user.participatedActivities || []).map((item) => Object.assign({}, item, { isCompleted: user.completedActivities.indexOf(item.id) !== -1 })) : []
    });
  },
  openActivity(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/activity-detail/index?id=${id}` });
  }
});
