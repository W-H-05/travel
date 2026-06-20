const { getActivityById } = require('../../utils/data');
const store = require('../../utils/store');
const achievementFeedback = require('../../utils/achievement-feedback');

Page({
  data: {
    activity: null,
    user: null,
    isSignedUp: false,
    isCompleted: false,
    achievementPopupVisible: false,
    achievementPopup: null,
    achievementQueue: []
  },
  onLoad(options) {
    const activity = getActivityById(options.id);
    if (activity) {
      wx.setNavigationBarTitle({ title: activity.title });
      this.setData({ activity });
    }
  },
  onShow() {
    const user = store.getCurrentUser();
    const activity = this.data.activity;
    this.setData({
      user,
      isSignedUp: !!(user && activity && user.participatedActivities.some((item) => item.id === activity.id)),
      isCompleted: !!(user && activity && user.completedActivities.some((item) => item === activity.id))
    });
  },
  onUnload() {
    achievementFeedback.clear(this);
  },
  handleAchievementClose() {
    achievementFeedback.advance(this);
  },
  handleSignUp() {
    const result = store.signUpForActivity(this.data.activity);
    if (!result.ok) {
      wx.showModal({
        title: '需要登录',
        content: '登录后才能报名公益活动。',
        success: (res) => {
          if (res.confirm) {
            wx.reLaunch({ url: '/pages/login/index' });
          }
        }
      });
      return;
    }
    this.onShow();
    wx.showToast({ title: '报名成功', icon: 'success' });
  },
  handleComplete() {
    const result = store.completeActivity(this.data.activity);
    if (!result.ok) {
      wx.showModal({
        title: '需要登录',
        content: '登录后才能保存活动完成状态。',
        success: (res) => {
          if (res.confirm) {
            wx.reLaunch({ url: '/pages/login/index' });
          }
        }
      });
      return;
    }
    this.onShow();
    if (achievementFeedback.hasUnlocks(result.unlocked)) {
      achievementFeedback.queue(this, result.unlocked);
      return;
    }
    wx.showToast({ title: `已获得 ${this.data.activity.points} 积分`, icon: 'success' });
  }
});
